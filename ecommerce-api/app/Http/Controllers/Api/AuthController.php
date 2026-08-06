<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Throwable;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = DB::transaction(function () use ($request) {
                return User::create([
                    'role_id' => $request->integer('role_id', 1),
                    'name' => $request->string('name')->trim()->toString(),
                    'email' => $request->string('email')->trim()->toString(),
                    'phone' => $request->input('phone'),
                    'password' => Hash::make($request->password),
                ]);
            });

            $token = $user
                ->createToken('auth_token')
                ->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Kullanıcı başarıyla oluşturuldu.',
                'token' => $token,
                'user' => new UserResource(
                    $user->load('role')
                ),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Kullanıcı oluşturulamadı.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (
            !Auth::attempt(
                $request->only('email', 'password')
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'E-posta veya şifre hatalı.',
            ], 401);
        }

        $user = $request->user();

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Giriş başarılı.',
            'token' => $token,
            'user' => new UserResource(
                $user->load('role')
            ),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()
            ?->currentAccessToken()
            ?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Çıkış başarılı.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Kullanıcı bilgileri getirildi.',
            'user' => new UserResource(
                $request->user()->load('role')
            ),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:3',
                'max:100',
            ],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],
            'city' => [
                'nullable',
                'string',
                'max:100',
            ],
            'district' => [
                'nullable',
                'string',
                'max:100',
            ],
            'address' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'district' => $validated['district'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil bilgileri güncellendi.',
            'user' => new UserResource(
                $user->fresh()->load('role')
            ),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = $request->user();

        if (
            !Hash::check(
                $validated['current_password'],
                $user->password
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Mevcut şifreniz hatalı.',
                'errors' => [
                    'current_password' => [
                        'Mevcut şifreniz hatalı.',
                    ],
                ],
            ], 422);
        }

        $user->update([
            'password' => Hash::make(
                $validated['password']
            ),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Şifreniz başarıyla güncellendi.',
        ]);
    }
}
