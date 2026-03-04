import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ActivityItem, ProfileData } from './api';
import { profileApi } from './api';
import { Link, useNavigate } from 'react-router-dom';

type ProfileFormValues = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  skills: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
};

type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

const validate = (values: ProfileFormValues): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};

  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!values.title.trim()) errors.title = 'Title is required.';
  if (!values.location.trim()) errors.location = 'Location is required.';
  if (!values.bio.trim() || values.bio.trim().length < 10) {
    errors.bio = 'Bio should be at least 10 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.website && !/^https?:\/\//.test(values.website)) {
    errors.website = 'Website should start with http:// or https://';
  }

  if (values.linkedin && !/^https?:\/\//.test(values.linkedin)) {
    errors.linkedin = 'LinkedIn URL should start with http:// or https://';
  }

  if (values.github && !/^https?:\/\//.test(values.github)) {
    errors.github = 'GitHub URL should start with http:// or https://';
  }

  if (values.twitter && !/^https?:\/\//.test(values.twitter)) {
    errors.twitter = 'Twitter URL should start with http:// or https://';
  }

  if (!values.skills.trim()) {
    errors.skills = 'Add at least one skill.';
  }

  return errors;
};

const toFormValues = (profile: ProfileData): ProfileFormValues => ({
  name: profile.name ?? '',
  title: profile.title ?? '',
  location: profile.location ?? '',
  email: profile.contact.email ?? '',
  phone: profile.contact.phone ?? '',
  bio: profile.bio ?? '',
  skills: profile.skills.join(', '),
  linkedin: profile.social.linkedin ?? '',
  github: profile.social.github ?? '',
  twitter: profile.social.twitter ?? '',
  website: profile.social.website ?? ''
});

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [initialProfile, setInitialProfile] = useState<ProfileData | null>(
    null
  );
  const [values, setValues] = useState<ProfileFormValues | null>(null);
  const [experienceValues, setExperienceValues] = useState<
    ProfileData['experience']
  >([]);
  const [educationValues, setEducationValues] = useState<
    ProfileData['education']
  >([]);
  const [activityValues, setActivityValues] = useState<ActivityItem[]>([]);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profile, activityItems] = await Promise.all([
          profileApi.getProfile(),
          profileApi.getActivity()
        ]);
        setInitialProfile(profile);
        setValues(toFormValues(profile));
        setAvatarPreview(profile.avatarUrl);
        setExperienceValues(profile.experience);
        setEducationValues(profile.education);
        setActivity(activityItems);
        setActivityValues(activityItems);
      } catch {
        setSubmitError('Unable to load profile for editing.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  });

  const hasChanges = useMemo(() => {
    if (!initialProfile || !values) return false;
    const currentSkills = values.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    return (
      initialProfile.name !== values.name ||
      initialProfile.title !== values.title ||
      initialProfile.location !== values.location ||
      initialProfile.bio !== values.bio ||
      initialProfile.contact.email !== values.email ||
      (initialProfile.contact.phone ?? '') !== values.phone ||
      initialProfile.social.linkedin !== values.linkedin ||
      initialProfile.social.github !== values.github ||
      initialProfile.social.twitter !== values.twitter ||
      initialProfile.social.website !== values.website ||
      initialProfile.skills.join(',') !== currentSkills.join(',') ||
      initialProfile.avatarUrl !== avatarPreview ||
      JSON.stringify(initialProfile.experience) !==
        JSON.stringify(experienceValues) ||
      JSON.stringify(initialProfile.education) !==
        JSON.stringify(educationValues) ||
      JSON.stringify(activity) !== JSON.stringify(activityValues)
    );
  }, [
    activity,
    activityValues,
    avatarPreview,
    educationValues,
    experienceValues,
    initialProfile,
    values
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (values) {
      const fieldErrors = validate(values);
      setErrors(fieldErrors);
    }
  };

  const updateExperienceField = (
    index: number,
    field: 'title' | 'company' | 'startDate' | 'endDate' | 'description',
    value: string
  ) => {
    setExperienceValues((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const updateEducationField = (
    index: number,
    field: 'school' | 'degree' | 'field' | 'startDate' | 'endDate',
    value: string
  ) => {
    setEducationValues((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const updateActivityField = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    setActivityValues((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values) return;

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setTouched(
      Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<string, boolean>
      )
    );

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const skillsArray = values.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const [updatedProfile, updatedActivity] = await Promise.all([
        profileApi.updateProfile({
          name: values.name,
          title: values.title,
          location: values.location,
          bio: values.bio,
          avatarUrl: avatarPreview,
          skills: skillsArray,
          experience: experienceValues,
          education: educationValues,
          contact: {
            email: values.email,
            phone: values.phone || undefined
          },
          social: {
            linkedin: values.linkedin || undefined,
            github: values.github || undefined,
            twitter: values.twitter || undefined,
            website: values.website || undefined
          }
        }),
        profileApi.updateActivity(activityValues)
      ]);

      setInitialProfile(updatedProfile);
      setActivity(updatedActivity);
      setSubmitSuccess('Profile updated successfully.');

      setTimeout(() => {
        navigate('/profile');
      }, 800);
    } catch {
      setSubmitError('Something went wrong while saving your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !values) {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded-lg w-40" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const fieldError = (name: keyof ProfileFormValues) =>
    touched[name] && errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    ) : null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            Edit profile
          </h1>
          <p className="text-sm text-slate-300">
            Update your public information and how others see you.
          </p>
        </div>
        <Link
          to="/profile"
          className="text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          Cancel
        </Link>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2 text-sm">
          {submitSuccess}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-5 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
          {/* Avatar upload */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900">Profile photo</p>
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 cursor-pointer text-center text-xs transition ${
                isDragActive
                  ? 'border-sky-500 bg-sky-50'
                  : isDragReject
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={values.name}
                  className="mb-3 h-24 w-24 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl font-semibold">
                  {values.name ? values.name[0].toUpperCase() : '?'}
                </div>
              )}
              <p className="font-medium text-slate-800">
                Drag & drop or click to upload
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                PNG or JPG, up to 5MB.
              </p>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {fieldError('name')}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Headline / title
              </label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {fieldError('title')}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {fieldError('location')}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {fieldError('email')}
            </div>
          </div>
        </div>

        {/* About and skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Bio
            </label>
            <textarea
              name="bio"
              rows={5}
              value={values.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {fieldError('bio')}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Skills
            </label>
            <textarea
              name="skills"
              rows={5}
              value={values.skills}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="React, TypeScript, Tailwind CSS"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Separate skills with commas.
            </p>
            {fieldError('skills')}
          </div>
        </div>

        {/* Social links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              LinkedIn
            </label>
            <input
              type="url"
              name="linkedin"
              value={values.linkedin}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {fieldError('linkedin')}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              GitHub
            </label>
            <input
              type="url"
              name="github"
              value={values.github}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {fieldError('github')}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Twitter
            </label>
            <input
              type="url"
              name="twitter"
              value={values.twitter}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {fieldError('twitter')}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={values.website}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {fieldError('website')}
          </div>
        </div>

        {/* Experience */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Experience</h2>
          <p className="text-xs text-slate-500">
            Edit how your work history appears on your profile.
          </p>
          <div className="space-y-4">
            {experienceValues.map((exp, index) => (
              <div
                key={exp.id}
                className="rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Job title
                    </label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) =>
                        updateExperienceField(index, 'title', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Company
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperienceField(index, 'company', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Start date
                    </label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperienceField(
                          index,
                          'startDate',
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      End date
                    </label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperienceField(index, 'endDate', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) =>
                      updateExperienceField(
                        index,
                        'description',
                        e.target.value
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Education</h2>
          <p className="text-xs text-slate-500">
            Update your education details shown on your profile.
          </p>
          <div className="space-y-4">
            {educationValues.map((edu, index) => (
              <div
                key={edu.id}
                className="rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      School
                    </label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) =>
                        updateEducationField(index, 'school', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducationField(index, 'degree', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Field of study
                  </label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) =>
                      updateEducationField(index, 'field', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      Start date
                    </label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducationField(
                          index,
                          'startDate',
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">
                      End date
                    </label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducationField(index, 'endDate', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity (editable text) */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent activity
          </h2>
          <p className="text-xs text-slate-500">
            Fine-tune the titles and descriptions that appear in your activity
            feed.
          </p>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activityValues.map((item, index) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="mt-1">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                      item.type === 'post'
                        ? 'bg-sky-50 text-sky-700'
                        : item.type === 'connection'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-violet-50 text-violet-700'
                    }`}
                  >
                    {item.type === 'post'
                      ? 'P'
                      : item.type === 'connection'
                      ? 'C'
                      : 'I'}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      updateActivityField(index, 'title', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      updateActivityField(index, 'description', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Changes are saved to your profile when you click Save.
          </p>

          <div className="flex gap-3">
            <Link
              to="/profile"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !hasChanges}
              className="rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;