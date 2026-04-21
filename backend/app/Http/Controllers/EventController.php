<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Event;
use App\Models\EventGoing;
use App\Models\EventInterested;
use App\Models\EventVisibility;
use App\Models\User;
use App\Notifications\EventParticipationRequestNotification;
use App\Notifications\FollowedUserEventCreatedNotification;
use App\Support\EventHelper;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $viewer = Auth::user();

        $events = Event::query()
            ->with(['visibility', 'categories'])
            ->get()
            ->filter(fn (Event $event) => EventHelper::canUserSeeEventInAllEvents($viewer, $event))
            ->values();

        return $events->toResourceCollection();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $fields = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'price' => 'nullable|numeric',
            'background_image' => 'nullable|file|image|mimes:jpeg,png,jpg,svg|max:2048',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:event_categories,id',
            'visibility' => 'nullable|string|in:public,friends_only,private',
            'invitee_ids' => 'nullable|array',
            'invitee_ids.*' => 'integer|exists:users,id',
        ]);

        $fields['price'] = $fields['price'] ?? 0;

        // Extract categories and visibility before creating event
        $categories = $fields['categories'] ?? [];
        $visibility = $fields['visibility'] ?? 'public';
        $inviteeIds = $fields['invitee_ids'] ?? [];
        $addressName = trim((string) $fields['address_name']);
        unset($fields['categories']);
        unset($fields['visibility']);
        unset($fields['invitee_ids']);
        unset($fields['address_name']);

        // Get visibility id
        $visibilityModel = EventVisibility::where('name', $visibility)->first();
        if ($visibilityModel) {
            $fields['event_visibility_id'] = $visibilityModel->id;
        }

        $fields['start_date'] = Carbon::parse($fields['start_date'])->toDateTimeString();

        if (isset($fields['end_date']) && $fields['end_date'] != null) {
            $fields['end_date'] = Carbon::parse($fields['end_date'])->toDateTimeString();
        }

        $address = Address::create([
            'lat' => $fields['lat'],
            'lng' => $fields['lng'],
            'name' => $addressName,
        ]);

        $imagePath = null;
        if ($request->hasFile('background_image')) {
            $imagePath = Storage::disk('public')->put('BackgroundImages', $request->background_image);

            $fields['background_image_path'] = $imagePath;
        }

        unset($fields['lat']);
        unset($fields['lng']);
        unset($fields['background_image']);

        $fields['address_id'] = $address->id;

        $creator = Auth::user();
        $fields['user_id'] = $creator->id;

        try {
            $event = Event::create($fields);

            // Attach categories if provided
            if (!empty($categories)) {
                $event->categories()->attach($categories);
            }

            if (!empty($inviteeIds)) {
                $this->sendParticipationRequests($event, $creator, $inviteeIds);
            }

            $this->notifyFollowersAboutNewEvent($event, $creator);
        } catch (\Exception $exception) {
            Log::info('Error'. $exception->getMessage());

            // Delete the uploaded file if event creation failed
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'error' => 'Failed to create event. Please try again later.' . $exception->getMessage(),
            ], 500);
        }

        Log::info("Post Created successfully");

        return response()->json([
            'status' => 'ok',
            'message' => 'You successfully created event',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        $user = Auth::user();
        $event->loadMissing(['user', 'visibility', 'categories']);

        if (! EventHelper::canUserAccessEvent($user, $event)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You do not have access to this event.',
            ], 403);
        }

        $isInterested = false;
        $isGoing = false;

        if ($user) {
            $isInterested = $event->interestedUsers()
                ->where('user_id', $user->id)
                ->exists();

            $isGoing = $event->goingUsers()
                ->where('user_id', $user->id)
                ->exists();
        }

        $friendIds = $user
            ? $user->friends()->pluck('users.id')->map(static fn ($id) => (int) $id)->all()
            : [];

        $goingUsers = $event->goingUsers()
            ->with('user')
            ->get()
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->values();

        $interestedUsers = $event->interestedUsers()
            ->with('user')
            ->get()
            ->pluck('user')
            ->filter()
            ->unique('id')
            ->values();

        $sortedGoingUsers = $this->sortUsersByFriendship($goingUsers, $friendIds);
        $sortedInterestedUsers = $this->sortUsersByFriendship($interestedUsers, $friendIds);

        $host = $event->user;

        return response()->json([
            'event' => $event->toResource(),
            'meta' => [
                'isInterested' => $isInterested,
                'isGoing' => $isGoing,
                'host' => $host ? $this->mapUserDto($host, $friendIds) : null,
                'goingCount' => $goingUsers->count(),
                'interestedCount' => $interestedUsers->count(),
                'goingUsers' => $sortedGoingUsers->map(fn (User $target) => $this->mapUserDto($target, $friendIds))->values(),
                'interestedUsers' => $sortedInterestedUsers->map(fn (User $target) => $this->mapUserDto($target, $friendIds))->values(),
            ]
        ]);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $editor = Auth::user();

        if (! $editor || (int) $editor->id !== (int) $event->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only event author can edit this event.',
            ], 403);
        }

        $fields = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'price' => 'nullable|numeric',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'visibility' => 'nullable|string|in:public,friends_only,private',
        ]);

        try {
            $event->title = $fields['title'];
            $event->description = $fields['description'] ?? null;
            $event->start_date = Carbon::parse($fields['start_date'])->toDateTimeString();
            $event->end_date = isset($fields['end_date']) && $fields['end_date'] !== null
                ? Carbon::parse($fields['end_date'])->toDateTimeString()
                : null;
            $event->price = $fields['price'] ?? 0;

            if (! empty($fields['visibility'])) {
                $visibilityModel = EventVisibility::query()
                    ->where('name', $fields['visibility'])
                    ->first();

                if ($visibilityModel) {
                    $event->event_visibility_id = $visibilityModel->id;
                }
            }

            $event->save();

            if ($event->address) {
                $event->address->update([
                    'name' => trim((string) $fields['address_name']),
                    'lat' => $fields['lat'],
                    'lng' => $fields['lng'],
                ]);
            }

            return response()->json([
                'status' => 'ok',
                'message' => 'Event updated successfully.',
            ]);
        } catch (Throwable $e) {
            Log::error('Event update failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong while updating event.',
            ], 500);
        }
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event): JsonResponse
    {
        $editor = Auth::user();

        if (! $editor || (int) $editor->id !== (int) $event->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only event author can delete this event.',
            ], 403);
        }

        try {
            if ($event->background_image_path && Storage::disk('public')->exists($event->background_image_path)) {
                Storage::disk('public')->delete($event->background_image_path);
            }

            $address = $event->address;
            $event->delete();

            if ($address) {
                $address->delete();
            }

            return response()->json([
                'status' => 'ok',
                'message' => 'Event deleted successfully.',
            ]);
        } catch (Throwable $e) {
            Log::error('Event delete failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong while deleting event.',
            ], 500);
        }
    }

    public function interested(Event $event, Request $request) {
        try {
            $viewer = Auth::user();
            if (! EventHelper::canUserAccessEvent($viewer, $event)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have access to this event.',
                ], 403);
            }

            $request->validate([
                'interested' => 'required|boolean',
            ]);

            if ($request->interested) {
                EventInterested::firstOrCreate([
                    'event_id' => $event->id,
                    'user_id' => $viewer->id,
                ]);
            } else {
                EventInterested::where([
                    'event_id' => $event->id,
                    'user_id' => $viewer->id,
                ])->delete();
            }

            return response()->json([
                'status' => 'ok',
            ]);
        } catch (Throwable $e) {
            \Log::error('Interested toggle failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong while updating interest.',
            ], 500);
        }
    }
    public function going(Event $event, Request $request) {
        try {
            $viewer = Auth::user();
            if (! EventHelper::canUserAccessEvent($viewer, $event)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have access to this event.',
                ], 403);
            }

            $request->validate([
                'going' => 'required|boolean',
            ]);

            if ($request->going) {
                EventGoing::firstOrCreate([
                    'event_id' => $event->id,
                    'user_id' => $viewer->id,
                ]);
            } else {
                EventGoing::where([
                    'event_id' => $event->id,
                    'user_id' => $viewer->id,
                ])->delete();
            }

            return response()->json([
                'status' => 'ok',
            ]);

        } catch (Throwable $e) {
            \Log::error('Going toggle failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong while updating going.',
            ], 500);
        }
    }

    public function requestParticipation(Event $event, Request $request): JsonResponse
    {
        try {
            $sender = Auth::user();
            if (! EventHelper::canUserAccessEvent($sender, $event)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You do not have access to this event.',
                ], 403);
            }

            $validated = $request->validate([
                'friend_ids' => 'required|array|min:1',
                'friend_ids.*' => 'integer|exists:users,id',
            ]);

            $this->sendParticipationRequests($event, $sender, $validated['friend_ids']);

            return response()->json([
                'status' => 'ok',
                'message' => 'Participation requests sent.',
            ]);
        } catch (Throwable $e) {
            \Log::error('Participation request sending failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong while sending requests.',
            ], 500);
        }
    }

    /**
     * Sends participation notifications only to users who are friends with sender
     */
    private function sendParticipationRequests(Event $event, User $sender, array $friendIds)
    {
        $validFriendIds = collect($friendIds)
            ->map(static fn ($id) => (int) $id)
            ->filter(static fn ($id) => $id > 0)
            ->unique()
            ->values();

        if ($validFriendIds->isEmpty()) {
            return;
        }

        $receivers = User::query()->whereIn('id', $validFriendIds->all())->get();

        foreach ($receivers as $receiver) {
            $receiver->notify(new EventParticipationRequestNotification($sender, $event));
        }
    }

    private function notifyFollowersAboutNewEvent(Event $event, User $creator): void
    {
        $followers = $creator->followers()
            ->where('users.id', '!=', $creator->id)
            ->get();

        foreach ($followers as $follower) {
            $follower->notify(new FollowedUserEventCreatedNotification($creator, $event));
        }
    }

    private function sortUsersByFriendship(Collection $users, array $friendIds): Collection
    {
        return $users->sort(function (User $left, User $right) use ($friendIds) {
            $leftIsFriend = in_array((int) $left->id, $friendIds, true);
            $rightIsFriend = in_array((int) $right->id, $friendIds, true);

            if ($leftIsFriend !== $rightIsFriend) {
                return $leftIsFriend ? -1 : 1;
            }

            return strcasecmp($left->name, $right->name);
        })->values();
    }

    private function mapUserDto(User $user, array $friendIds): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_path' => $user->avatar_path,
            'is_friend' => in_array((int) $user->id, $friendIds, true),
        ];
    }

}
