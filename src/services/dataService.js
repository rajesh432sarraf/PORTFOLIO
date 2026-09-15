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
import { fetchProjectsFromDatabase, fetchContentFromDatabase } from './storageService.js';

export async function getProjects() {
  return await fetchProjectsFromDatabase(localProjects);
}

export async function getExperience() {
  return await fetchContentFromDatabase('experience', localExperience);
}

export async function getAchievements() {
  return await fetchContentFromDatabase('achievements', localAchievements);
}

export async function getCertifications() {
  return await fetchContentFromDatabase('certificates', localCertifications);
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
