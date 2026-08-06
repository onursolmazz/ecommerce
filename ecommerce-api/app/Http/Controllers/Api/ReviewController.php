<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->with('user')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Yorumlar getirildi.',
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(ReviewRequest $request): JsonResponse
    {
        $product = Product::where('status', true)
            ->findOrFail($request->product_id);

        $review = Review::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'product_id' => $product->id,
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

    public function update(
        ReviewRequest $request,
        Review $review
    ): JsonResponse {
        abort_if(
            $review->user_id !== Auth::id(),
            403,
            'Bu yorumu düzenleme yetkiniz yok.'
        );

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Yorum güncellendi.',
            'data' => new ReviewResource(
                $review->fresh()->load('user')
            ),
        ]);
    }

    public function destroy(Review $review): JsonResponse
    {
        abort_if(
            $review->user_id !== Auth::id(),
            403,
            'Bu yorumu silme yetkiniz yok.'
        );

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Yorum silindi.',
            'data' => [
                'id' => $review->id,
            ],
        ]);
    }
}
