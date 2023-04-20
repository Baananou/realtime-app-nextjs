"use client"
import { FC, useState } from 'react'
import Button from './ui/Button'
import { AddFriendValidator } from '@/lib/validations/add-friend'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

interface AddFriendButtonProps { }

type FormData = z.infer<typeof AddFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({ }) => {
    const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

    const {
        register, handleSubmit, setError, formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(AddFriendValidator)
    })
    const addFriend = async (email: string) => {
        try {
            const validatedEmail = AddFriendValidator.parse({ email })

            await axios.post('/api/friends/add', {
                email: validatedEmail,
            })
            setShowSuccessState(true)
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError('email', { message: error.message })
                toast.error(error.message)
                return
            }
            if (error instanceof AxiosError) {
                setError('email', { message: error.response?.data })
                toast.error(error.response?.data)
                return
            }
            setError('email', { message: 'Something Went Wrong' })
            toast.error('Something Went Wrong')
        }
    }
    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
            <label htmlFor="email" className='block text-sm font-medium leading-6 text-gray-500'>
                add friend by Github email
            </label>
            <div className='mt-2 flex gap-4'>
                <input
                    {...register('email')}
                    type="text" className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm: leading-6'
                    placeholder='you@exemple.com' />
                <Button>Add</Button>
            </div>
            <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
            {showSuccessState ? (
                <p className='mt-1 text-sm text-green-600'>Friend Request Sent !</p>
            ) : null}
        </form>
    )
}

export default AddFriendButton