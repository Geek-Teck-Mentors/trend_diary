import { Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/application/web/components/shadcn/card'
import { LinkAsButton } from '../components/ui/link'

export default function AdminDashboard() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardContent className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Users className='h-6 w-6 text-gray-400' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <CardTitle className='text-sm font-medium text-gray-500 truncate'>
                  ユーザ管理
                </CardTitle>
                <CardDescription className='text-lg font-medium text-gray-900'>
                  ユーザ一覧・権限管理
                </CardDescription>
              </div>
            </div>
          </CardContent>
          <CardFooter className='bg-gray-50 px-5 py-3'>
            <LinkAsButton to='/admin/users'>ユーザ管理を開く</LinkAsButton>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
