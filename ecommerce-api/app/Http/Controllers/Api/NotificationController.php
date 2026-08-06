<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id)
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Bildirimler getirildi.',
            'data' => NotificationResource::collection($notifications),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    public function read(Notification $notification)
    {
        abort_if($notification->user_id !== auth()->id, 403);

        $notification->update([
            'is_read' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bildirim okundu.',
            'data' => new NotificationResource($notification),
        ]);
    }

    public function readAll()
    {
        Notification::where('user_id', auth()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Tüm bildirimler okundu.'
        ]);
    }

    public function destroy(Notification $notification)
    {
        abort_if($notification->user_id !== auth()->id, 403);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bildirim silindi.'
        ]);
    }
}
