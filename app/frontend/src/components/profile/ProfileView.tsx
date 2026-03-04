import React, { useEffect, useState } from 'react';
import type { ActivityItem, ProfileData } from './api';
import { profileApi } from './api';
import { Link } from 'react-router-dom';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileData, activityData] = await Promise.all([
          profileApi.getProfile(),
          profileApi.getActivity()
        ]);
        setProfile(profileData);
        setActivity(activityData);
      } catch (e) {
        setError('Unable to load profile right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 animate-pulse space-y-4">
        <div className="h-40 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-60 bg-slate-200 rounded-xl" />
          <div className="h-60 bg-slate-200 rounded-xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
          {error ?? 'Profile not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-sky-100"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              {profile.name}
            </h1>
            <p className="text-sky-700 font-medium">{profile.title}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              {profile.location}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:items-end gap-3">
          <div className="flex gap-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">
                {profile.connectionsCount}
              </p>
              <p>Connections</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {profile.mutualConnections}
              </p>
              <p>Mutual</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/profile/edit"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: about, skills, contact */}
        <section className="space-y-4 md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              About
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {profile.bio}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Email: </span>
                <a
                  href={`mailto:${profile.contact.email}`}
                  className="text-sky-700 hover:underline"
                >
                  {profile.contact.email}
                </a>
              </p>
              {profile.contact.phone && (
                <p>
                  <span className="font-medium text-slate-800">Phone: </span>
                  {profile.contact.phone}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Social links
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              {profile.social.linkedin && (
                <a
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sky-700 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {profile.social.github && (
                <a
                  href={profile.social.github}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sky-700 hover:underline"
                >
                  GitHub
                </a>
              )}
              {profile.social.twitter && (
                <a
                  href={profile.social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sky-700 hover:underline"
                >
                  Twitter
                </a>
              )}
              {profile.social.website && (
                <a
                  href={profile.social.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sky-700 hover:underline"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Right column: experience, education, activity */}
        <section className="space-y-4 md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Experience
            </h2>
            <div className="mt-3 space-y-4">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-sky-100 pl-4">
                  <p className="text-sm text-slate-500">
                    {exp.startDate} – {exp.endDate}
                  </p>
                  <p className="font-medium text-slate-900">{exp.title}</p>
                  <p className="text-sm text-slate-600">{exp.company}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">Education</h2>
            <div className="mt-3 space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-emerald-100 pl-4">
                  <p className="text-sm text-slate-500">
                    {edu.startDate} – {edu.endDate}
                  </p>
                  <p className="font-medium text-slate-900">{edu.school}</p>
                  <p className="text-sm text-slate-600">
                    {edu.degree} in {edu.field}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent activity
            </h2>
            <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="mt-1">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileView;