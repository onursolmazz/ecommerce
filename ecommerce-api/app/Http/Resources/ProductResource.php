<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryImage = null;

        if ($this->relationLoaded('images')) {
            $primaryImage =
                $this->images->firstWhere('is_primary', true) ??
                $this->images->first();
        }

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'seller_id' => $this->seller_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'stock' => (int) $this->stock,
            'status' => (bool) $this->status,

            'category' => $this->whenLoaded(
                'category',
                function () {
                    return [
                        'id' => $this->category?->id,
                        'name' => $this->category?->name,
                        'slug' => $this->category?->slug,
                        'image' => $this->category?->image,
                        'image_url' => $this->getImageUrl(
                            $this->category?->image
                        ),
                    ];
                }
            ),

            'seller' => $this->whenLoaded(
                'seller',
                function () {
                    return [
                        'id' => $this->seller?->id,
                        'name' => $this->seller?->name,
                    ];
                }
            ),

            'images' => $this->whenLoaded(
                'images',
                function () {
                    return $this->images
                        ->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'image' => $image->image,
                                'url' => $this->getImageUrl(
                                    $image->image
                                ),
                                'is_primary' => (bool) $image->is_primary,
                            ];
                        })
                        ->values();
                }
            ),

            'primary_image' => $primaryImage
                ? [
                    'id' => $primaryImage->id,
                    'image' => $primaryImage->image,
                    'url' => $this->getImageUrl(
                        $primaryImage->image
                    ),
                    'is_primary' => (bool) $primaryImage->is_primary,
                ]
                : null,

            'reviews_count' => (int) (
                $this->reviews_count ?? 0
            ),

            'favorites_count' => (int) (
                $this->favorites_count ?? 0
            ),

            'average_rating' => round(
                (float) (
                    $this->reviews_avg_rating ?? 0
                ),
                1
            ),

            'is_favorite' => Auth::check()
                ? $this->favorites()
                ->where('user_id', Auth::id())
                ->exists()
                : false,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function getImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (
            str_starts_with($path, 'http://') ||
            str_starts_with($path, 'https://')
        ) {
            return $path;
        }

        $normalizedPath = preg_replace(
            '#^(public/|storage/)#',
            '',
            $path
        );

        return asset(
            'storage/' . ltrim($normalizedPath, '/')
        );
    }
}
