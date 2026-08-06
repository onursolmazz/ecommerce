<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;

class ReviewController extends Controller
{
    public function index(Product $product)
    {
        $reviews = $product->reviews()
            ->with('user')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Yorumlar getirildi.',
            'data' => ReviewResource::collection($reviews),
        ]);
    }

    public function store(ReviewRequest $request)
    {
        $review = Review::updateOrCreate(
            [
                'user_id' => auth()->id,
                'product_id' => $request->product_id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Yorum başarıyla kaydedildi.',
            'data' => new ReviewResource(
                $review->load('user')
            ),
        ], 201);
    }

    public function update(ReviewRequest $request, Review $review)
    {
        abort_if($review->user_id !== auth()->id, 403);

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Yorum güncellendi.',
            'data' => new ReviewResource(
                $review->load('user')
            ),
        ]);
    }

    public function destroy(Review $review)
    {
        abort_if($review->user_id !== auth()->id, 403);

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Yorum silindi.',
        ]);
    }
}
