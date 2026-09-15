/**
 * Data Service for Public Portfolio.
 * Provides a resilient unified interface to retrieve content:
 * Checks remote API first; if unavailable, seamlessly serves verified data from src/data/.
 */

import { projects as localProjects, archiveProjects as localArchive } from '../data/projects.js';
import { experiences as localExperience } from '../data/experience.js';
import { achievements as localAchievements } from '../data/achievements.js';
import { certifications as localCertifications } from '../data/certifications.js';
import { profiles as localProfiles } from '../data/profiles.js';

export async function getProjects() {
  try {
    const res = await fetch('/api/content?type=projects');
    if (res.ok) {
      const data = await res.json();
      if (data && data.projects && data.projects.length > 0) {
        return data.projects;
      }
    }
  } catch (err) {
    // API is offline or unconfigured; fallback to local verified data
  }
  return localProjects;
}

export async function getExperience() {
  try {
    const res = await fetch('/api/content?type=experience');
    if (res.ok) {
      const data = await res.json();
      if (data && data.experience && data.experience.length > 0) {
        return data.experience;
      }
    }
  } catch (err) {
    // Fallback to local verified data
  }
  return localExperience;
}

export function getLocalAchievements() {
  return localAchievements;
}

export function getLocalCertifications() {
  return localCertifications;
}

export function getLocalProfiles() {
  return localProfiles;
}

export function getLocalArchive() {
  return localArchive;
}
