<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'is_popular' => $this->is_popular,
            'view_count' => $this->view_count,
            'sales_count' => $this->sales_count,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'seller' => new UserResource($this->whenLoaded('seller')),
            'images' => ProductImageResource::collection(
                $this->whenLoaded('images')
            ),
            'is_favorite' => $this->favorites()
                ->where('user_id', auth()->id)
                ->exists(),
            'average_rating' => round($this->reviews()->avg('rating'), 1),

            'reviews_count' => $this->reviews()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
