import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

const fieldClass = 'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 transition focus:border-stone-950 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400';
const selectClass = `${fieldClass} appearance-none`;

export default function Create({ unclaimedGyms, states, districts, cities, facilities, categories }) {
    const [applicationType, setApplicationType] = useState('claim');
    const [selectedGym, setSelectedGym] = useState('');
    const [formData, setFormData] = useState({ name: '', address: '', state_id: '', district_id: '', city_id: '', whatsapp_number: '', phone_number: '', description: '', facilities: [], categories: [] });
    const [businessDoc, setBusinessDoc] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    useEffect(() => {
        setFilteredDistricts(formData.state_id ? districts.filter((district) => district.state_id === parseInt(formData.state_id)) : []);
        setFormData((previous) => ({ ...previous, district_id: '', city_id: '' }));
        setFilteredCities([]);
    }, [formData.state_id, districts]);
    useEffect(() => {
        setFilteredCities(formData.district_id ? cities.filter((city) => city.district_id === parseInt(formData.district_id)) : []);
        setFormData((previous) => ({ ...previous, city_id: '' }));
    }, [formData.district_id, cities]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (type !== 'checkbox') { setFormData((previous) => ({ ...previous, [name]: value })); return; }
        setFormData((previous) => ({ ...previous, [name]: checked ? [...previous[name], parseInt(value)] : previous[name].filter((id) => id !== parseInt(value)) }));
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setErrors((previous) => ({ ...previous, business_doc: 'File size must be less than 5MB' })); return; }
        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { setErrors((previous) => ({ ...previous, business_doc: 'Only PDF, JPG, JPEG, and PNG files are allowed' })); return; }
        setBusinessDoc(file);
        setErrors((previous) => ({ ...previous, business_doc: null }));
    };
    const handleSubmit = (event) => {
        event.preventDefault(); setIsSubmitting(true); setErrors({});
        const payload = new FormData();
        payload.append('application_type', applicationType);
        if (businessDoc) payload.append('business_doc', businessDoc);
        if (applicationType === 'claim') payload.append('gym_id', selectedGym);
        else {
            ['name', 'address', 'state_id', 'district_id', 'city_id', 'whatsapp_number', 'phone_number', 'description'].forEach((key) => payload.append(key, formData[key]));
            formData.facilities.forEach((id) => payload.append('facilities[]', id));
            formData.categories.forEach((id) => payload.append('categories[]', id));
        }
        router.post('/apply-owner', payload, { onError: setErrors, onFinish: () => setIsSubmitting(false) });
    };
    const selectedGymData = unclaimedGyms?.find((gym) => gym.id === parseInt(selectedGym));
    const switchType = (type) => { setApplicationType(type); setSelectedGym(''); };

    return (
        <MainLayout>
            <Head title="Become a Gym Owner" />
            <div className="bg-[#f7f7f5] py-10 sm:py-14">
                <div className="mx-auto max-w-4xl px-5 sm:px-8">
                    <header className="border-b border-stone-200 pb-9"><p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">GymFinder Perak · Partner programme</p><h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-stone-950 sm:text-4xl">Manage your gym listing.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Claim an existing unclaimed listing or apply to add a new gym to the directory.</p></header>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><SectionTitle step="01" title="Choose an application type" description="Select the option that best describes your gym." /><div className="mt-5 grid gap-3 sm:grid-cols-2"><TypeOption active={applicationType === 'claim'} title="Claim an existing gym" description="Take ownership of an unclaimed listing." onClick={() => switchType('claim')} /><TypeOption active={applicationType === 'new'} title="Register a new gym" description="Submit a new gym for directory review." onClick={() => switchType('new')} /></div></section>

                        {applicationType === 'claim' ? <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><SectionTitle step="02" title="Select your gym" description="Choose the listing you want to manage." /><div className="mt-5"><FieldLabel required>Select a gym to claim</FieldLabel><select value={selectedGym} onChange={(event) => setSelectedGym(event.target.value)} className={selectClass} required><option value="">Select a gym…</option>{unclaimedGyms?.map((gym) => <option key={gym.id} value={gym.id}>{gym.name} — {gym.address}</option>)}</select>{selectedGymData && <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><p className="text-sm font-semibold text-stone-900">{selectedGymData.name}</p><p className="mt-1 text-xs text-stone-500">{selectedGymData.address}</p></div>}{unclaimedGyms?.length === 0 && <Notice tone="warning">No unclaimed gyms are available. Please register a new gym instead.</Notice>}</div></section> : <NewGymDetails formData={formData} errors={errors} handleInputChange={handleInputChange} states={states} filteredDistricts={filteredDistricts} filteredCities={filteredCities} facilities={facilities} categories={categories} />}

                        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><SectionTitle step={applicationType === 'claim' ? '03' : '03'} title="Verify ownership" description="Upload one official document to support your application." /><div className="mt-5"><FieldLabel required>Business document</FieldLabel><p className="-mt-1 mb-3 text-xs leading-5 text-stone-500">SSM registration, business license, or another official ownership document. PDF, JPG, or PNG up to 5 MB.</p><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="block w-full cursor-pointer rounded-xl border border-stone-300 bg-stone-50 text-sm text-stone-600 file:mr-4 file:border-0 file:bg-stone-950 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-700" required />{businessDoc && <Notice tone="success"><span className="font-semibold">{businessDoc.name}</span><span className="text-stone-500"> · {(businessDoc.size / 1024).toFixed(1)} KB</span></Notice>}{errors.business_doc && <ErrorText>{errors.business_doc}</ErrorText>}</div></section>

                        <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row"><Link href="/" className="rounded-xl border border-stone-300 px-5 py-3 text-center text-sm font-semibold text-stone-700 transition hover:border-stone-950">Cancel</Link><button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Submitting application…' : 'Submit application'}</button></div>
                    </form>
                    <aside className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><p className="text-sm font-bold text-stone-900">What happens next?</p><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Our team will review your application and ownership document. You’ll receive a notification after it is approved or rejected, usually within one to three business days.</p><Link href="/apply-owner/status" className="mt-4 inline-block text-sm font-semibold text-stone-950 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-950">Check application status</Link></aside>
                </div>
            </div>
        </MainLayout>
    );
}

function NewGymDetails({ formData, errors, handleInputChange, states, filteredDistricts, filteredCities, facilities, categories }) {
    return <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"><SectionTitle step="02" title="Tell us about your gym" description="Provide the core details for your new listing." /><div className="mt-6 space-y-6"><div className="grid gap-5 md:grid-cols-2"><Field label="Gym name" required error={errors.name}><input type="text" name="name" value={formData.name} onChange={handleInputChange} className={fieldClass} placeholder="Enter gym name" required /></Field><Field label="Phone number"><input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className={fieldClass} placeholder="e.g. 012-3456789" /></Field></div><Field label="Address" required error={errors.address}><textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className={fieldClass} placeholder="Enter full address" required /></Field><div className="grid gap-5 md:grid-cols-3"><Field label="State" required error={errors.state_id}><select name="state_id" value={formData.state_id} onChange={handleInputChange} className={selectClass} required><option value="">Select state</option>{states?.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select></Field><Field label="District" required error={errors.district_id}><select name="district_id" value={formData.district_id} onChange={handleInputChange} className={selectClass} required disabled={!formData.state_id}><option value="">Select district</option>{filteredDistricts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}</select></Field><Field label="City" required error={errors.city_id}><select name="city_id" value={formData.city_id} onChange={handleInputChange} className={selectClass} required disabled={!formData.district_id}><option value="">Select city</option>{filteredCities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></Field></div><Field label="WhatsApp number"><input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleInputChange} className={fieldClass} placeholder="e.g. 60123456789" /></Field><Field label="Description"><textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className={fieldClass} placeholder="Describe your gym, facilities, and what makes it special…" /></Field>{facilities?.length > 0 && <ChoiceGroup label="Facilities" name="facilities" options={facilities} selected={formData.facilities} onChange={handleInputChange} />}{categories?.length > 0 && <ChoiceGroup label="Categories" name="categories" options={categories} selected={formData.categories} onChange={handleInputChange} />}</div></section>;
}

function SectionTitle({ step, title, description }) { return <div className="flex gap-4"><span className="pt-0.5 font-mono text-xs font-bold text-stone-400">{step}</span><div><h2 className="text-lg font-bold tracking-[-0.02em] text-stone-950">{title}</h2><p className="mt-1 text-sm text-stone-500">{description}</p></div></div>; }
function TypeOption({ active, title, description, onClick }) { return <button type="button" onClick={onClick} className={`rounded-xl border p-5 text-left transition ${active ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'}`}><p className="text-sm font-bold">{title}</p><p className={`mt-2 text-xs leading-5 ${active ? 'text-stone-300' : 'text-stone-500'}`}>{description}</p></button>; }
function FieldLabel({ children, required }) { return <label className="mb-2 block text-sm font-semibold text-stone-700">{children}{required && <span className="ml-1 text-red-700">*</span>}</label>; }
function Field({ label, required, error, children }) { return <div><FieldLabel required={required}>{label}</FieldLabel>{children}{error && <ErrorText>{error}</ErrorText>}</div>; }
function ErrorText({ children }) { return <p className="mt-2 text-xs font-medium text-red-700">{children}</p>; }
function Notice({ tone, children }) { return <div className={`mt-3 rounded-xl border px-4 py-3 text-xs ${tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{children}</div>; }
function ChoiceGroup({ label, name, options, selected, onChange }) { return <div><FieldLabel>{label}</FieldLabel><div className="flex flex-wrap gap-2">{options.map((option) => { const checked = selected.includes(option.id); return <label key={option.id} className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-medium transition ${checked ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 text-stone-600 hover:border-stone-950'}`}><input type="checkbox" name={name} value={option.id} checked={checked} onChange={onChange} className="sr-only" />{option.name}</label>; })}</div></div>; }
