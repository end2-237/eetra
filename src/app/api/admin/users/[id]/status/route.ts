import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper pour vérifier si l'utilisateur est super admin
async function verifySuperAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isSuperAdmin) {
    return null
  }
  return session.user
}

// PUT /api/admin/users/[id]/status - Ban/Unban user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { isBanned } = await req.json()
    const userId = params.id

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Update user status by adding a banned flag to profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { legal: isBanned ? 'BANNED' : '' },
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: isBanned ? 'USER_BAN' : 'USER_UNBAN',
        resourceType: 'USER',
        resourceId: userId,
        details: { status: isBanned ? 'banned' : 'active' },
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
