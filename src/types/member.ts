export interface MemberUser {
  id: string
  name: string | null
  email: string | null
  isActive: boolean
  createdById: string | null
  createdAt: Date
}

export interface MemberMembership {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationMember {
  user: MemberUser
  membership: MemberMembership
}

export interface UserWithMembership {
  id: string
  name: string | null
  email: string | null
  isActive: boolean
  createdById: string | null
  createdAt: Date
  updatedAt: Date
  password?: string | null
  emailVerified?: Date | null
  image?: string | null
  deletedAt?: Date | null
  memberships: {
    id: string
    role: string
    organizationId: string
    createdAt: Date
    updatedAt: Date
  }[]
}
