<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminGymController;
use App\Http\Controllers\Admin\AdminGymOwnerApplicationController;
use App\Http\Controllers\GymController;
use App\Http\Controllers\GymOwnerApplicationController;
use App\Http\Controllers\Owner\CreateGymController;
use App\Http\Controllers\Owner\EditGymController;
use App\Http\Controllers\Owner\GymOwnerController;
use App\Http\Controllers\Owner\PhotoGymController;
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

    // Applying to become a gym owner — open to any logged-in "user", not role-gated
    Route::get('/apply-owner', [GymOwnerApplicationController::class, 'create'])->name('owner-applications.create');
    Route::post('/apply-owner', [GymOwnerApplicationController::class, 'store'])->name('owner-applications.store');
    Route::get('/apply-owner/status', [GymOwnerApplicationController::class, 'status'])->name('owner-applications.status');
});

/*
|--------------------------------------------------------------------------
| Super Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    Route::resource('gyms', AdminGymController::class)->except(['create', 'store']);
    Route::post('gyms/{gym}/approve', [AdminGymController::class, 'approve'])->name('gyms.approve');
    Route::post('gyms/{gym}/reject', [AdminGymController::class, 'reject'])->name('gyms.reject');
    Route::post('gyms/{gym}/suspend', [AdminGymController::class, 'suspend'])->name('gyms.suspend');

    Route::get('owner-applications', [AdminGymOwnerApplicationController::class, 'index'])->name('owner-applications.index');
    Route::get('owner-applications/{ownerApplication}', [AdminGymOwnerApplicationController::class, 'show'])->name('owner-applications.show');
    Route::get('owner-applications/{ownerApplication}/document', [AdminGymOwnerApplicationController::class, 'downloadDocument'])->name('owner-applications.document');
    Route::post('owner-applications/{ownerApplication}/approve', [AdminGymOwnerApplicationController::class, 'approve'])->name('owner-applications.approve');
    Route::post('owner-applications/{ownerApplication}/reject', [AdminGymOwnerApplicationController::class, 'reject'])->name('owner-applications.reject');
});

/*
|--------------------------------------------------------------------------
| Gym Owner
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:gym_owner,super_admin'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/dashboard', [GymOwnerController::class, 'dashboard'])->name('dashboard');
    Route::get('/gym/create', [CreateGymController::class, 'create'])->name('gym.create');
    Route::post('/gym', [CreateGymController::class, 'store'])->name('gym.store');
    Route::get('/gym/edit', [EditGymController::class, 'edit'])->name('gym.edit');
    Route::put('/gym', [EditGymController::class, 'update'])->name('gym.update');
    Route::get('/gym/photos', [PhotoGymController::class, 'index'])->name('gym.photos.index');
    Route::post('/gym/photos', [PhotoGymController::class, 'store'])->name('gym.photos.store');
    Route::post('/gym/photos/{image}/primary', [PhotoGymController::class, 'setPrimary'])->name('gym.photos.primary');
    Route::delete('/gym/photos/{image}', [PhotoGymController::class, 'destroy'])->name('gym.photos.destroy');
});

require __DIR__.'/auth.php';