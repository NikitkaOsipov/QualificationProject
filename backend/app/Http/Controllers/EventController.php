<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
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
     * Returns paginated list of events with applied filters.
     * Only future events are returned.
     */
    public function index(Request $request)
    {
        $viewer = Auth::user();

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:event_categories,id',
            'friends_only' => 'nullable|boolean',
            'following_only' => 'nullable|boolean',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'sort_by' => 'nullable|string|in:default,soonest,interested,going,cost',
            'sort_direction' => 'nullable|string|in:asc,desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ], [
            'date_to.after_or_equal' => 'Beigu datumam jābūt tādam pašam vai vēlākam par sākuma datumu.',
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $categoryIds = collect($validated['categories'] ?? [])
            ->unique()
            ->values()
            ->all();
        $friendsOnly = (bool) ($validated['friends_only'] ?? false);
        $followingOnly = (bool) ($validated['following_only'] ?? false);
        $dateFromValue = $validated['date_from'] ?? null;
        $dateToValue = $validated['date_to'] ?? null;
        $dateFrom = $dateFromValue ? Carbon::parse($dateFromValue)->startOfDay() : null;
        $dateTo = $dateToValue ? Carbon::parse($dateToValue)->endOfDay() : null;
        $sortBy = $validated['sort_by'] ?? 'default';
        $sortDirection = $validated['sort_direction'] ?? 'desc';
        $page = max(1, (int) ($validated['page'] ?? 1));
        $perPage = max(1, min((int) ($validated['per_page'] ?? 12), 50)); // Per page value 1 - 50

        $authorIds = $this->allowedAuthorIds($viewer, $friendsOnly, $followingOnly);

        $events = Event::query()
            ->with(['visibility', 'categories', 'address', 'user'])
            ->withCount(['goingUsers', 'interestedUsers'])
            ->get()
            ->filter(fn (Event $event) => EventHelper::canUserSeeEventInAllEvents($viewer, $event))
            ->filter(fn (Event $event) => $this->isEventInTheFuture($event))
            ->filter(fn (Event $event) => $this->matchesSearchQuery($event, $search))
            ->filter(fn (Event $event) => $this->matchesCategories($event, $categoryIds))
            ->filter(fn (Event $event) => $this->matchesDateRange($event, $dateFrom, $dateTo))
            ->filter(fn (Event $event) => $this->matchesAuthors($event, $authorIds))
            ->values();


        $events = $this->sortEvents($events, $sortBy, $sortDirection);

        $total = $events->count();
        $offset = ($page - 1) * $perPage;
        $pageItems = $events
            ->slice($offset, $perPage)
            ->values();

        return EventHelper::successResponse(
            data: EventResource::collection($pageItems)->resolve(),
            meta: [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $total === 0 ? 1 : ceil($total / $perPage),
                'has_more' => $offset + $pageItems->count() < $total,
                'applied_sort_by' => $sortBy,
                'applied_sort_direction' => $sortDirection,
            ]
        );
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
            'background_image' => 'nullable|file|image|mimes:jpeg,png,jpg,svg,webp|max:2048',
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
            $imagePath = Storage::disk('public')->putFile('BackgroundImages', $request->file('background_image'));

            if ($imagePath === false) {
                Log::error('Failed to persist event background image to public disk.');

                return EventHelper::errorResponse('Neizdevās augšupielādēt fona attēlu. Lūdzu, mēģiniet vēlreiz.', 500);
            }

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

            return EventHelper::errorResponse('Neizdevās izveidot pasākumu. Lūdzu, mēģiniet vēlreiz vēlāk.', 500);
        }

        return EventHelper::successResponse('Pasākums veiksmīgi izveidots.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        $user = Auth::user();
        $event->loadMissing(['user', 'visibility', 'categories']);

        if (! EventHelper::canUserAccessEvent($user, $event)) {
            return EventHelper::errorResponse('Jums nav piekļuves šim pasākumam.', 403);
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
            'data' => $event->toResource(),
            'meta' => [
                'is_interested' => $isInterested,
                'is_going' => $isGoing,
                'host' => $host ? $this->mapUserDto($host, $friendIds) : null,
                'going_count' => $goingUsers->count(),
                'interested_count' => $interestedUsers->count(),
                'going_users' => $sortedGoingUsers->map(fn (User $target) => $this->mapUserDto($target, $friendIds))->values(),
                'interested_users' => $sortedInterestedUsers->map(fn (User $target) => $this->mapUserDto($target, $friendIds))->values(),
            ]
        ]);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $editor = Auth::user();

        $canManageEvent = $editor && ($editor->isAdmin() || $editor->id === $event->user_id);

        if (! $canManageEvent) {
            return EventHelper::errorResponse('Šo pasākumu var rediģēt tikai autors vai administrators.', 403);
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

            return EventHelper::successResponse('Pasākums veiksmīgi atjaunināts.');
        } catch (Throwable $e) {
            Log::error('Event update failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return EventHelper::errorResponse('Pasākumu neizdevās atjaunināt.', 500);
        }
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event): JsonResponse
    {
        $editor = Auth::user();

        $canManageEvent = $editor && ($editor->isAdmin() || $editor->id === $event->user_id);

        if (! $canManageEvent) {
            return EventHelper::errorResponse('Šo pasākumu var dzēst tikai autors vai administrators.', 403);
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

            return EventHelper::successResponse('Pasākums veiksmīgi dzēsts.');
        } catch (Throwable $e) {
            Log::error('Event delete failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return EventHelper::errorResponse('Pasākumu neizdevās dzēst.', 500);
        }
    }

    public function interested(Event $event, Request $request) {
        try {
            $viewer = Auth::user();
            if (! EventHelper::canUserAccessEvent($viewer, $event)) {
                return EventHelper::errorResponse('Jums nav piekļuves šim pasākumam.', 403);
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

            return EventHelper::successResponse('Interese par pasākumu veiksmīgi atjaunināta.');
        } catch (Throwable $e) {
            \Log::error('Interested toggle failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return EventHelper::errorResponse('Neizdevās atjaunināt interesi par pasākumu.', 500);
        }
    }
    public function going(Event $event, Request $request) {
        try {
            $viewer = Auth::user();
            if (! EventHelper::canUserAccessEvent($viewer, $event)) {
                return EventHelper::errorResponse('Jums nav piekļuves šim pasākumam.', 403);
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

            return EventHelper::successResponse('Dalības statuss pasākumā veiksmīgi atjaunināts.');

        } catch (Throwable $e) {
            \Log::error('Going toggle failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return EventHelper::errorResponse('Neizdevās atjaunināt dalības statusu pasākumā.', 500);
        }
    }

    public function requestParticipation(Event $event, Request $request): JsonResponse
    {
        try {
            $sender = Auth::user();
            if (! EventHelper::canUserAccessEvent($sender, $event)) {
                return EventHelper::errorResponse('Jums nav piekļuves šim pasākumam.', 403);
            }

            $validated = $request->validate([
                'friend_ids' => 'required|array|min:1',
                'friend_ids.*' => 'integer|exists:users,id',
            ]);

            $this->sendParticipationRequests($event, $sender, $validated['friend_ids']);

            return EventHelper::successResponse('Dalības pieprasījumi veiksmīgi nosūtīti.');
        } catch (Throwable $e) {
            \Log::error('Participation request sending failed', [
                'error' => $e->getMessage(),
                'event_id' => $event->id,
                'user_id' => Auth::id(),
            ]);

            return EventHelper::errorResponse('Neizdevās nosūtīt dalības pieprasījumus.', 500);
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

    /**
     * Checks if event is not in the past
     */
    private function isEventInTheFuture(Event $event): bool
    {
        $now = now();
        $eventEndsAt = $event->end_date
            ? Carbon::parse($event->end_date)
            : Carbon::parse($event->start_date);

        return $eventEndsAt->greaterThanOrEqualTo($now);
    }

    private function matchesSearchQuery(Event $event, string $search): bool
    {
        if ($search === '') {
            return true;
        }

        // mb_strtolower works for latvian chars
        $lowerSearch = mb_strtolower($search);

        if (str_contains(mb_strtolower($event->title), $lowerSearch)
            || str_contains(mb_strtolower($event->address->name), $lowerSearch)) {
            return true;
        }

        return false;
    }

    private function matchesCategories(Event $event, array $categoryIds): bool
    {
        if ($categoryIds === []) {
            return true;
        }

        return $event->categories
            ->pluck('id')
            ->intersect($categoryIds)
            ->isNotEmpty();
    }

    private function matchesDateRange(Event $event, ?Carbon $dateFrom, ?Carbon $dateTo): bool
    {
        $eventStart = Carbon::parse($event->start_date);

        if ($dateFrom && $eventStart->lt($dateFrom)) {
            return false;
        }

        if ($dateTo && $eventStart->gt($dateTo)) {
            return false;
        }

        return true;
    }

    private function matchesAuthors(Event $event, ?array $authorIds): bool
    {
        if ($authorIds === null) {
            return true;
        }

        return in_array($event->user_id, $authorIds, true);
    }

    /**
     * Finds all ids of allowed authors. Happens if user chose to show only friends or following people
     */
    private function allowedAuthorIds(?User $viewer, bool $friendsOnly, bool $followingOnly): ?array
    {
        // if none of the options is chosen or viewer is guest return null
        if ((! $friendsOnly && ! $followingOnly) || ! $viewer) {
            return null;
        }

        $authorIds = collect();

        if ($friendsOnly) {
            $friendIds = $viewer->friends()->pluck('users.id');
            $authorIds = $authorIds->merge($friendIds);
        }

        if ($followingOnly) {
            $followingIds = $viewer->following()->pluck('users.id');
            $authorIds = $authorIds->merge($followingIds);
        }

        $authorIds = $authorIds
            ->unique()
            ->values();

        return $authorIds->all();
    }

    private function sortEvents(Collection $events, string $sortBy, string $sortDirection): Collection
    {
        return $events->sort(function (Event $left, Event $right) use ($sortBy, $sortDirection) {
            if ($sortBy === 'soonest') {
                return $this->compareBySoonest($left, $right, $sortDirection);
            }

            if ($sortBy === 'interested') {
                return $this->compareByCountAndSoonest($left, $right, 'interested_users_count', $sortDirection);
            }

            if ($sortBy === 'going') {
                return $this->compareByCountAndSoonest($left, $right, 'going_users_count', $sortDirection);
            }

            if ($sortBy === 'cost') {
                return $this->compareByCost($left, $right, $sortDirection);
            }

            // Default sorting by popularity and time
            return $this->compareByDefault($left, $right, $sortDirection);
        })->values();
    }

    /**
     * Sorts on how hot are events by hotScore function. If they are the same
     */
    private function compareByDefault(Event $left, Event $right, string $sortDirection): int
    {
        $now = now();

        $scoreComparison = $this->applySortDirection(
            $this->hotScore($left, $now) <=> $this->hotScore($right, $now),
            $sortDirection
        );

        if ($scoreComparison !== 0) {
            return $scoreComparison;
        }

        return $this->compareBySoonest($left, $right, $sortDirection);
    }

    /**
     * Sorts by soonest start date. If start dates are the same then by earliest end date
     */
    private function compareBySoonest(Event $left, Event $right, string $sortDirection): int
    {
        $leftStart = Carbon::parse($left->start_date)->timestamp;
        $rightStart = Carbon::parse($right->start_date)->timestamp;

        if ($leftStart !== $rightStart) {
            return $this->applySortDirection($leftStart <=> $rightStart, $sortDirection);
        }

        $leftEnd = Carbon::parse($left->end_date)->timestamp;
        $rightEnd = Carbon::parse($right->end_date)->timestamp;

        return $this->applySortDirection($leftEnd <=> $rightEnd, $sortDirection);
    }

    /**
     * Sorts by count field (interested or going) and if they are the same then by soonest
     */
    private function compareByCountAndSoonest(Event $left, Event $right, string $countField, string $sortDirection): int
    {
        $countComparison = $this->applySortDirection(
            ((int) ($left->{$countField} ?? 0)) <=> ((int) ($right->{$countField} ?? 0)),
            $sortDirection
        );

        if ($countComparison !== 0) {
            return $countComparison;
        }

        return $this->compareBySoonest($left, $right, $sortDirection);
    }

    /**
     * Sorts by price and if they are the same then by soonest
     */
    private function compareByCost(Event $left, Event $right, string $sortDirection): int
    {
        $leftPrice = (float) ($left->price ?? 0);
        $rightPrice = (float) ($right->price ?? 0);
        $comparison = $this->applySortDirection($leftPrice <=> $rightPrice, $sortDirection);

        if ($comparison !== 0) {
            return $comparison;
        }

        return $this->compareBySoonest($left, $right, $sortDirection);
    }

    /**
     * Determines how "HOT" event is.
     */
    private function hotScore(Event $event, Carbon $now): float
    {
        $goingCount = $event->going_users_count ?? 0;
        $interestedCount = $event->interested_users_count ?? 0;

        $start = Carbon::parse($event->start_date);
        $hoursUntilStart = max(0, $now->diffInHours($start));
        // from 0 to 14, 1 day = 14 points, 14 days (2 weeks) = 0 points
        $timeBoost = max(0, 14 - min($hoursUntilStart / 24, 14));

        // Score calculates: 3 points for each going user, 2 for interested and how soon event is in next 2 weeks
        return ($goingCount * 3) + ($interestedCount * 2) + $timeBoost;
    }

    /**
     * Flips sign if sort direction is desc. 1 -> -1; -1 -> 1
     */
    private function applySortDirection(int $comparison, string $sortDirection): int
    {
        return $sortDirection === 'desc' ? -$comparison : $comparison;
    }

}
