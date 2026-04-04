<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::all(['id', 'name']);

        return response()->json($categories);
    }

    /**
     * Get a specific category
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json($category);

    }

    /**
     * Create a new category
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:event_categories,name',
            ]);

            Category::create($validated);

            return response()->json([
                'status' => 'ok',
                'message' => 'Category created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create category',
                'errors' => ['server error' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Update a category
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:event_categories,name,' . $category->id,
            ]);

            $category->update($validated);

            return response()->json([
                'status' => 'ok',
                'message' => 'Category updated successfully',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update category',
                'errors' => ['server error' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Delete a category
     */
    public function destroy(Category $category): JsonResponse
    {
        try {
            // Check if category is being used by any events
            $eventCount = $category->events()->count();

            if ($eventCount > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Cannot delete category. It is currently used by {$eventCount} event(s). Please reassign or delete those events first.",
                ], 409);
            }

            $category->delete();

            return response()->json([
                'status' => 'ok',
                'message' => 'Category deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete category',
                'errors' => ['server error' => [$e->getMessage()]],
            ], 500);
        }
    }
}


