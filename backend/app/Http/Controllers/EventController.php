<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Event;
use App\Models\EventGoing;
use App\Models\EventInterested;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Ramsey\Uuid\Type\Integer;
use Throwable;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Event::all()->toResourceCollection();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $fields = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'price' => 'nullable|numeric',
            'background_image' => 'nullable|file|image|mimes:jpeg,png,jpg,svg|max:2048',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
//            'event_type_id' => 'required|exists:event_types,id',
//            'event_visibility_id' => 'required|exists:event_visibilities,id',
//            'event_access_type_id' => 'required|exists:event_access_types,id',
//            'address_id' => 'required|exists:addresses,id',
//            'holiday_id' => 'nullable|exists:holidays,id',
        ]);

        $fields['price'] = $fields['price'] ?? 0;

        Log::info("Post -----------------------------------------------");
        Log::info("Fields", [json_encode($fields)]);

        $fields['start_date'] = Carbon::parse($fields['start_date'])->toDateTimeString();
        $fields['end_date'] = Carbon::parse($fields['end_date'])->toDateTimeString();


        $address = Address::create([
            'lat' => $fields['lat'],
            'lng' => $fields['lng'],
            'name' => 'Event Location',
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

        Log::info("Post ----------------------------------------------");
        Log::info(Auth::id());
        Log::info("Post ----------------------------------------------");
        $fields['user_id'] = Auth::id();

        try {
            $event = Event::create($fields);
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
            'success' => 'Event created successfully',
            'event' => $event,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        // Add multiple auth checks in future
        return $event->toResource();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        //
    }

    public function interested(Event $event, Request $request) {
        try {
            $request->validate([
                'interested' => 'required|boolean',
            ]);

            $user = Auth::user();

            if ($request->interested) {
                EventInterested::firstOrCreate([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ]);
            } else {
                EventInterested::where([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ])->delete();
            }

            return response()->json([
                'status' => 'ok',
                'interested' => $request->interested,
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
            $request->validate([
                'going' => 'required|boolean',
            ]);

            $user = Auth::user();

            if ($request->going) {
                EventGoing::firstOrCreate([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ]);
            } else {
                EventGoing::where([
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ])->delete();
            }

            return response()->json([
                'status' => 'ok',
                'interested' => $request->interested,
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
}
