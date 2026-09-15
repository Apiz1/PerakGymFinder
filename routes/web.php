<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminGymController;
use App\Http\Controllers\Admin\AdminGymOwnerApplicationController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\Admin\AdminSearchController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdminPendingController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Owner\CreateGymController;
use App\Http\Controllers\Owner\EditGymController;
use App\Http\Controllers\Owner\GymOwnerController;
use App\Http\Controllers\Owner\OwnerFacilitiesController;
use App\Http\Controllers\Owner\OwnerGymOperatingHourController;
use App\Http\Controllers\Owner\OwnerMembershipController;
use App\Http\Controllers\Owner\OwnerReviewController;
use App\Http\Controllers\Owner\PhotoGymController;
use App\Http\Controllers\Owner\OwnerReportController;
use App\Http\Controllers\Owner\OwnerAnalyticsController;
use App\Http\Controllers\GymController;
use App\Http\Controllers\GymOwnerApplicationController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GymReportController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schedule;
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
    Route::post('/apply-owner', [GymOwnerApplicationController::class, 'store'])->middleware('throttle:10,1')->name('owner-applications.store');
    Route::get('/apply-owner/status', [GymOwnerApplicationController::class, 'status'])->name('owner-applications.status');

    Route::post('/gyms/{gym}/reviews', [ReviewController::class, 'store'])->middleware('throttle:10,1')->name('reviews.store');
    Route::get('/gyms/{gym}/report', [GymReportController::class, 'create'])->name('gyms.report.create');
    Route::post('/gyms/{gym}/report/store', [GymReportController::class, 'store'])->middleware('throttle:10,1')->name('gyms.report');
});

/*
|--------------------------------------------------------------------------
| Super Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    Route::get('search', [AdminSearchController::class, 'index'])->name('search.index');

    Route::resource('gyms', AdminGymController::class)->except(['create', 'store']);
    Route::post('gyms/{gym}/approve', [AdminGymController::class, 'approve'])->name('gyms.approve');
    Route::post('gyms/{gym}/reject', [AdminGymController::class, 'reject'])->name('gyms.reject');
    Route::post('gyms/{gym}/suspend', [AdminGymController::class, 'suspend'])->name('gyms.suspend');

    Route::get('owner-applications', [AdminGymOwnerApplicationController::class, 'index'])->name('owner-applications.index');
    Route::get('owner-applications/{ownerApplication}', [AdminGymOwnerApplicationController::class, 'show'])->name('owner-applications.show');
    Route::get('owner-applications/{ownerApplication}/document', [AdminGymOwnerApplicationController::class, 'downloadDocument'])->name('owner-applications.document');
    Route::post('owner-applications/{ownerApplication}/approve', [AdminGymOwnerApplicationController::class, 'approve'])->name('owner-applications.approve');
    Route::post('owner-applications/{ownerApplication}/reject', [AdminGymOwnerApplicationController::class, 'reject'])->name('owner-applications.reject');
    Route::delete('owner-applications/{ownerApplication}', [AdminGymOwnerApplicationController::class, 'destroy'])->name('owner-applications.destroy');

    Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::post('reviews/{review}/approve', [AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::post('reviews/{review}/flag', [AdminReviewController::class, 'flag'])->name('reviews.flag');
    Route::delete('reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [AdminUserController::class, 'show'])->name('users.show');
    Route::put('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::post('users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    Route::post('users/{user}/toggle-active', [AdminUserController::class, 'toggleActive'])->name('users.toggle-active');

    Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
    Route::get('reports/{report}', [AdminReportController::class, 'show'])->name('reports.show');
    Route::post('reports/{report}/resolve', [AdminReportController::class, 'resolve'])->name('reports.resolve');
    Route::post('reports/{report}/dismiss', [AdminReportController::class, 'dismiss'])->name('reports.dismiss');

    Route::get('locations', [LocationController::class, 'index'])->name('locations.index');
    Route::post('locations/states', [LocationController::class, 'storeState'])->name('locations.states.store');
    Route::post('locations/districts', [LocationController::class, 'storeDistrict'])->name('locations.districts.store');
    Route::post('locations/cities', [LocationController::class, 'storeCity'])->name('locations.cities.store');
    Route::delete('locations/states/{state}', [LocationController::class, 'destroyState'])->name('locations.states.destroy');
    Route::delete('locations/districts/{district}', [LocationController::class, 'destroyDistrict'])->name('locations.districts.destroy');
    Route::delete('locations/cities/{city}', [LocationController::class, 'destroyCity'])->name('locations.cities.destroy');

    Route::get('taxonomy', [TaxonomyController::class, 'index'])->name('taxonomy.index');
    Route::post('taxonomy/facilities', [TaxonomyController::class, 'storeFacility'])->name('taxonomy.facilities.store');
    Route::post('taxonomy/categories', [TaxonomyController::class, 'storeCategory'])->name('taxonomy.categories.store');
    Route::delete('taxonomy/facilities/{facility}', [TaxonomyController::class, 'destroyFacility'])->name('taxonomy.facilities.destroy');
    Route::delete('taxonomy/categories/{category}', [TaxonomyController::class, 'destroyCategory'])->name('taxonomy.categories.destroy');

    Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [AdminNotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    Route::get('activity-log/{activity}', [ActivityLogController::class, 'show'])->name('activity-log.show');
    Schedule::command('activitylog:clean')->weekly();

    Route::get('pending', [AdminPendingController::class, 'index'])->name('pending.index');

    Route::get('settings', [AdminSettingController::class, 'index'])->name('settings.index');
    Route::put('settings', [AdminSettingController::class, 'update'])->name('settings.update');
    
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
    
    Route::get('/gym/hours', [OwnerGymOperatingHourController::class, 'edit'])->name('gym.hours.edit');
    Route::put('/gym/hours', [OwnerGymOperatingHourController::class, 'update'])->name('gym.hours.update');
    
    Route::get('/gym/facilities', [OwnerFacilitiesController::class, 'edit'])->name('gym.facilities.edit');
    Route::put('/gym/facilities', [OwnerFacilitiesController::class, 'update'])->name('gym.facilities.update');
    
    Route::get('/gym/memberships', [OwnerMembershipController::class, 'index'])->name('gym.memberships.index');
    Route::post('/gym/memberships', [OwnerMembershipController::class, 'store'])->name('gym.memberships.store');
    Route::put('/gym/memberships/{membershipPlan}', [OwnerMembershipController::class, 'update'])->name('gym.memberships.update');
    Route::post('/gym/memberships/{membershipPlan}/toggle', [OwnerMembershipController::class, 'toggleActive'])->name('gym.memberships.toggle');
    Route::delete('/gym/memberships/{membershipPlan}', [OwnerMembershipController::class, 'destroy'])->name('gym.memberships.destroy');
    
    Route::get('/gym/reviews', [OwnerReviewController::class, 'index'])->name('gym.reviews.index');
    Route::post('/gym/reviews/{review}/reply', [OwnerReviewController::class, 'storeReply'])->name('gym.reviews.reply.store');
    Route::put('/gym/reviews/{review}/reply', [OwnerReviewController::class, 'updateReply'])->name('gym.reviews.reply.update');
    
    Route::get('/gym/reports', [OwnerReportController::class, 'index'])->name('gym.reports.index');
    Route::get('/gym/reports/{report}', [OwnerReportController::class, 'show'])->name('gym.reports.show');
    Route::post('/gym/reports/{report}/resolve', [OwnerReportController::class, 'markResolved'])->name('gym.reports.resolve');

    Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [AdminNotificationController::class, 'markAllRead'])->name('notifications.read-all');

    Route::get('/gym/analytics', [OwnerAnalyticsController::class, 'index'])->name('gym.analytics.index');
});

require __DIR__.'/auth.php';