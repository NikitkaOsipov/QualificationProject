<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Support\EventHelper;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index()
    {
        $categories = Category::all(['id', 'name']);

        return response()->json($categories);
    }

    /**
     * Get a specific category
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Create a new category
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:event_categories,name',
            ]);

            Category::create($validated);

            return EventHelper::successResponse('Kategorija veiksmīgi izveidota.', 201);
        } catch (ValidationException $e) {
            return EventHelper::errorResponse('Pārbaude neizdevās.', 422, $e->errors());
        } catch (\Exception $e) {
            return EventHelper::errorResponse('Neizdevās izveidot kategoriju.', 500, ['server error' => [$e->getMessage()]]);
        }
    }

    /**
     * Update a category
     */
    public function update(Request $request, Category $category)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:event_categories,name,' . $category->id,
            ]);

            $category->update($validated);

            return EventHelper::successResponse('Kategorija veiksmīgi atjaunināta.');
        } catch (ValidationException $e) {
            return EventHelper::errorResponse('Pārbaude neizdevās.', 422, $e->errors());
        } catch (\Exception $e) {
            return EventHelper::errorResponse('Neizdevās atjaunināt kategoriju.', 500, ['server error' => [$e->getMessage()]]);
        }
    }

    /**
     * Delete a category
     */
    public function destroy(Category $category)
    {
        try {
            // Check if category is being used by any events
            $eventCount = $category->events()->count();

            if ($eventCount > 0) {
                return EventHelper::errorResponse(
                    "Kategoriju nevar dzēst. To pašlaik izmanto {$eventCount} pasākums(-i). Vispirms pārsakiet vai dzēsiet šos pasākumus.",
                    409,
                );
            }

            $category->delete();

            return EventHelper::successResponse('Kategorija veiksmīgi dzēsta.');
        } catch (\Exception $e) {
            return EventHelper::errorResponse('Neizdevās dzēst kategoriju.', 500, ['server error' => [$e->getMessage()]]);
        }
    }
}


