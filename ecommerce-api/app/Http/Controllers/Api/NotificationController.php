<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = max(
            1,
            min((int) $request->input('per_page', 10), 50)
        );

        $query = Notification::query()
            ->where('user_id', Auth::id());

        if ($request->has('is_read')) {
            $query->where(
                'is_read',
                $request->boolean('is_read')
            );
        }

        if ($request->filled('type')) {
            $query->where(
                'type',
                $request->input('type')
            );
        }

        $notifications = $query
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $unreadCount = Notification::query()
            ->where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Bildirimler başarıyla getirildi.',
            'data' => NotificationResource::collection(
                $notifications->getCollection()
            ),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'from' => $notifications->firstItem(),
                'to' => $notifications->lastItem(),
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    public function read(
        Notification $notification
    ): JsonResponse {
        $this->ensureOwnership($notification);

        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bildirim okundu.',
            'data' => new NotificationResource(
                $notification->fresh()
            ),
        ]);
    }

    public function readAll(): JsonResponse
    {
        $updatedCount = Notification::query()
            ->where('user_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Tüm bildirimler okundu.',
            'data' => [
                'updated_count' => $updatedCount,
            ],
        ]);
    }

    public function destroy(
        Notification $notification
    ): JsonResponse {
        $this->ensureOwnership($notification);

        $notificationId = $notification->id;
        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bildirim silindi.',
            'data' => [
                'id' => $notificationId,
            ],
        ]);
    }

    private function ensureOwnership(
        Notification $notification
    ): void {
        abort_unless(
            (int) $notification->user_id === (int) Auth::id(),
            403,
            'Bu bildirim üzerinde işlem yetkiniz yok.'
        );
    }
}
