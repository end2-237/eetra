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

// GET /api/admin/templates - Get public templates
export async function GET(req: NextRequest) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      prisma.customTemplate.findMany({
        where: { isPublic: true },
        include: { user: { select: { email: true, name: true } } },
        skip,
        take: limit,
        orderBy: { usageCount: 'desc' },
      }),
      prisma.customTemplate.count({ where: { isPublic: true } }),
    ])

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/templates/[id] - Delete a template
export async function DELETE(req: NextRequest) {
  const admin = await verifySuperAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json(
        { error: 'Missing template ID' },
        { status: 400 }
      )
    }

    await prisma.customTemplate.delete({
      where: { id: templateId },
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'TEMPLATE_DELETE',
        resourceType: 'TEMPLATE',
        resourceId: templateId,
        details: {},
      },
    })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
