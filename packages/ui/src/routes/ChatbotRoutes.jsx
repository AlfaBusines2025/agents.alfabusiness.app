import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import ProtectedMinimalLayout from './ProtectedMinimalLayout'

// canvas routing
const ChatbotFull = Loadable(lazy(() => import('@/views/chatbot')))

// ==============================|| CANVAS ROUTING ||============================== //

const ChatbotRoutes = {
    path: '/',
    element: <ProtectedMinimalLayout />,
    children: [
        {
            path: '/chatbot/:id',
            element: <ChatbotFull />
        }
    ]
}

export default ChatbotRoutes
