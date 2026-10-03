export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'converted'
export type ApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'converted'
export type SolutionStatus = 'draft' | 'verified' | 'published' | 'archived'

export interface Idea {
  id: string
  created_at: string
  title: string
  description: string
  author_email: string
  target_group?: string
  category?: string
  moderation_status: ModerationStatus
}

export interface Application {
  id: string
  created_at: string
  project_title: string
  problem_statement: string
  proposed_solution: string
  expected_impact: string
  applicant_name: string
  applicant_email: string
  status: ApplicationStatus
}

export interface Solution {
  id: string
  created_at: string
  title: string
  summary: string
  full_description: string
  target_group: string
  spatial_scope: string
  key_benefits: string[]
  implementation_steps: string[]
  status: SolutionStatus
  source_idea_id?: string | null
  source_application_id?: string | null
  embedding?: number[]
}