<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $createdAt = $this->created_at?->toIso8601String();
        $updatedAt = $this->updated_at?->toIso8601String();

        return [
            'id' => $this->id,
            'text' => $this->text,
            'created_at' => $createdAt,
            'updated_at' => $updatedAt !== $createdAt ? $updatedAt : null,
            'user' => new UserResource($this->user),
        ];
    }
}
