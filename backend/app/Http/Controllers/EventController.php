<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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

        $fields['start_date'] = Carbon::parse($fields['start_date'])->toDateTimeString();
        $fields['end_date'] = Carbon::parse($fields['end_date'])->toDateTimeString();


        $address = Address::create([
            'latitude' => $fields['lat'],
            'longitude' => $fields['lng'],
            'name' => 'Event Location',
        ]);
        unset($fields['lat']);
        unset($fields['lng']);

        $fields['address_id'] = $address->id;

        $fields['user_id'] = Auth::id();

        $imagePath = null;

        if ($request->hasFile('background_image')) {
            $imagePath = Storage::disk('public')->put('background_image', $request->avatar);

            $fields['background_image'] = $imagePath;
        }

        try {
            Log::info('Before Creating event with fields', $fields);
            $event = Event::create($fields);
            Log::info('After Creating event with fields', $fields);
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
        //
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
}
