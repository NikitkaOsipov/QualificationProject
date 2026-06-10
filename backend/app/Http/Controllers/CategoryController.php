<?php
/**
 * Šis kontrolieris nodrošina pasākumu kategoriju iegūšanu.
 * Tas satur divas galvenās funkcijas:
 * - index(): Parāda visu kategoriju sarakstu.
 * - show(): Parāda vienas konkrētas kategorijas datus.
 */

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
}
