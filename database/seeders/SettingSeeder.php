<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'GymFinder.My', 'type' => 'string', 'group' => 'general', 'label' => 'Site Name', 'description' => 'Shown in the browser tab and emails.'],
            ['key' => 'contact_email', 'value' => 'admin@gymfinder.my', 'type' => 'string', 'group' => 'general', 'label' => 'Contact Email'],
            ['key' => 'contact_phone', 'value' => '', 'type' => 'string', 'group' => 'general', 'label' => 'Contact Phone'],

            ['key' => 'auto_approve_gyms', 'value' => '0', 'type' => 'boolean', 'group' => 'moderation', 'label' => 'Auto-approve new gym submissions', 'description' => 'If off, every new gym starts as pending and needs manual approval.'],
            ['key' => 'auto_approve_reviews', 'value' => '1', 'type' => 'boolean', 'group' => 'moderation', 'label' => 'Auto-approve new reviews', 'description' => 'If off, reviews need admin approval before appearing publicly.'],
            ['key' => 'turnstile_enabled', 'value' => '1', 'type' => 'boolean', 'group' => 'moderation', 'label' => 'Enable Cloudflare Turnstile', 'description' => 'CAPTCHA on login/register.'],

            ['key' => 'max_gym_images', 'value' => '10', 'type' => 'integer', 'group' => 'limits', 'label' => 'Max photos per gym'],
            ['key' => 'max_membership_plans', 'value' => '10', 'type' => 'integer', 'group' => 'limits', 'label' => 'Max membership plans per gym'],
            ['key' => 'activity_log_retention_days', 'value' => '7', 'type' => 'integer', 'group' => 'limits', 'label' => 'Activity log retention (days)'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}