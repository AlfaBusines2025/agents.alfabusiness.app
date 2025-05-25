import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MainLayout from '@/layout/MainLayout'
import { useDispatch } from 'react-redux'

const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
}

const ProtectedMainLayout = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const queryParams = new URLSearchParams(location.search)
    const automateId = queryParams.get('automate_id')

    // Debug logs for cookies and query params
    console.log('🔍 [ProtectedMainLayout] Query Params:', location.search)
    console.log('🔍 [ProtectedMainLayout] automate_id:', automateId)

    const vendorUid = getCookie('vendorUid')
    const userUid = getCookie('userUid') || '0'
    console.log('🔍 [ProtectedMainLayout] vendorUid:', vendorUid)
    console.log('🔍 [ProtectedMainLayout] userUid:', userUid)

    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        console.log('🔄 [ProtectedMainLayout] useEffect triggered')
        if (!vendorUid) {
            console.warn('⚠️ [ProtectedMainLayout] Missing vendorUid')
            setError('Faltan datos de autenticación.')
            setLoading(false)
            return
        }

        let url = `https://crm.alfabusiness.app/api/${vendorUid}/vendor-settings-automate?user_uid=${userUid}`
        if (automateId) {
            url += `&automate_id=${automateId}`
        }
        console.log('🌐 [ProtectedMainLayout] Fetch URL:', url)

        fetch(url)
            .then((response) => {
                console.log('📨 [ProtectedMainLayout] Fetch response status:', response.status)
                return response.json()
            })
            .then((data) => {
                console.log('✅ [ProtectedMainLayout] Data received:', data)
                if (data.is_admin === true) {
                    console.log('✔️ [ProtectedMainLayout] User is admin, dispatching SET_ADMIN_STATE')
                    dispatch({
                        type: 'SET_ADMIN_STATE',
                        payload: {
                            is_admin: true,
                            login_automate: data.login_automate
                        }
                    })
                    setAuthorized(true)
                } else {
                    console.warn('⛔ [ProtectedMainLayout] User is not admin')
                    setAuthorized(false)
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error('❌ [ProtectedMainLayout] Fetch error:', err)
                setError(err.message || 'Error al validar la autenticación.')
                setLoading(false)
            })
    }, [vendorUid, automateId, userUid, dispatch])

    console.log('🔍 [ProtectedMainLayout] State - loading:', loading, 'error:', error, 'authorized:', authorized)

    if (loading) {
        console.log('⌛ [ProtectedMainLayout] Loading...')
        return <div>Cargando...</div>
    }
    if (error || !authorized) {
        console.warn('🚧 [ProtectedMainLayout] No acceso, redirecting')
        window.location.href = 'https://crm.alfabusiness.app/vendor-console'
        return null
    }

    console.log('🏁 [ProtectedMainLayout] Access granted, rendering MainLayout')
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    )
}

export default ProtectedMainLayout
