import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

const page = async ({ }) => {
    const session = await getServerSession(authOptions)
    return (
        <pre>{JSON.stringify(session)}</pre> //this returns the sessions details
    )
}

export default page