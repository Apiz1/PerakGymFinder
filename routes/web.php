<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminGymController;
use App\Http\Controllers\GymController;
use App\Http\Controllers\Owner\GymOwnerController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [GymController::class, 'index'])->name('home');
Route::get('/gyms/{gym:slug}', [GymController::class, 'show'])->name('gyms.show');

/*
|--------------------------------------------------------------------------
| Authenticated Common Routes
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Role-Protected Routes
|--------------------------------------------------------------------------
*/

// Super Admin Only
Route::middleware(['auth', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::resource('gyms', AdminGymController::class)->except(['create', 'store']);
    Route::post('gyms/{gym}/approve', [AdminGymController::class, 'approve'])->name('gyms.approve');
    Route::post('gyms/{gym}/reject', [AdminGymController::class, 'reject'])->name('gyms.reject');
    Route::post('gyms/{gym}/suspend', [AdminGymController::class, 'suspend'])->name('gyms.suspend');
    // e.g., Route::get('/gyms', [AdminGymController::class, 'index'])->name('gyms.index');
});

// Gym Owners & Super Admins
Route::middleware(['auth', 'role:gym_owner,super_admin'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/dashboard', [GymOwnerController::class, 'dashboard'])->name('dashboard');
    // e.g., Route::get('/my-gym', [OwnerGymController::class, 'show'])->name('gym.show');
});

require __DIR__.'/auth.php';