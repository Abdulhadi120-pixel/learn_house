'use client'
import React, { useEffect, useMemo } from 'react'

import Link from 'next/link'
import { Package, Crown, Shield, User, Users, SignOut, CaretDown, Globe, Check } from '@phosphor-icons/react'
import UserAvatar from '@components/Objects/UserAvatar'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getUriWithOrg } from '@services/config/config'
import Tooltip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@components/ui/dropdown-menu"
import { signOut } from '@components/Contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { AVAILABLE_LANGUAGES } from '@/lib/languages'
import LanguageSwitcher from '@components/Utils/LanguageSwitcher'
import { getMenuColorClasses } from '@services/utils/ts/colorUtils'

interface RoleInfo {
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  description: string;
}

interface CustomRoleInfo {
  name: string;
  description?: string;
}

export const HeaderProfileBox = ({ primaryColor = '' }: { primaryColor?: string }) => {
  const session = useLHSession() as any
  const { isAdmin, loading, userRoles, rights } = useAdminStatus()
  const org = useOrg() as any
  const { t, i18n } = useTranslation()
  const colors = getMenuColorClasses(primaryColor)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  useEffect(() => { }
    , [session])

  const userRoleInfo = useMemo((): RoleInfo | null => {
    if (!userRoles || userRoles.length === 0) return null;

    // Find the highest priority role for the current organization
    const orgRoles = userRoles.filter((role: any) => role.org.id === org?.id);

    if (orgRoles.length === 0) return null;

    // Sort by role priority (admin > maintainer > instructor > user)
    const sortedRoles = orgRoles.sort((a: any, b: any) => {
      const getRolePriority = (role: any) => {
        if (role.role.role_uuid === 'role_global_admin' || role.role.id === 1) return 4;
        if (role.role.role_uuid === 'role_global_maintainer' || role.role.id === 2) return 3;
        if (role.role.role_uuid === 'role_global_instructor' || role.role.id === 3) return 2;
        return 1;
      };
      return getRolePriority(b) - getRolePriority(a);
    });

    const highestRole = sortedRoles[0];

    // Define role configurations based on actual database roles
    const roleConfigs: { [key: string]: RoleInfo } = {
      'role_global_admin': {
        name: t('roles.role_admin'),
        icon: <Crown size={12} weight="fill" />,
        bgColor: 'bg-purple-600',
        textColor: 'text-white',
        description: t('roles.role_admin_desc')
      },
      'role_global_maintainer': {
        name: t('roles.role_maintainer'),
        icon: <Shield size={12} weight="fill" />,
        bgColor: 'bg-blue-600',
        textColor: 'text-white',
        description: t('roles.role_maintainer_desc')
      },
      'role_global_instructor': {
        name: t('roles.role_instructor'),
        icon: <Users size={12} weight="fill" />,
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        description: t('roles.role_instructor_desc')
      },
      'role_global_user': {
        name: t('roles.role_user'),
        icon: <User size={12} weight="fill" />,
        bgColor: 'bg-gray-500',
        textColor: 'text-white',
        description: t('roles.role_user_desc')
      }
    };

    // Determine role based on role_uuid or id
    let roleKey = 'role_global_user'; // default
    if (highestRole.role.role_uuid) {
      roleKey = highestRole.role.role_uuid;
    } else if (highestRole.role.id === 1) {
      roleKey = 'role_global_admin';
    } else if (highestRole.role.id === 2) {
      roleKey = 'role_global_maintainer';
    } else if (highestRole.role.id === 3) {
      roleKey = 'role_global_instructor';
    }

    return roleConfigs[roleKey] || roleConfigs['role_global_user'];
  }, [userRoles, org?.id]);

  const customRoles = useMemo((): CustomRoleInfo[] => {
    if (!userRoles || userRoles.length === 0) return [];

    // Find roles for the current organization
    const orgRoles = userRoles.filter((role: any) => role.org.id === org?.id);

    if (orgRoles.length === 0) return [];

    // Filter for custom roles (not system roles)
    const customRoles = orgRoles.filter((role: any) => {
      // Check if it's a system role
      const isSystemRole =
        role.role.role_uuid?.startsWith('role_global_') ||
        [1, 2, 3, 4].includes(role.role.id) ||
        ['Admin', 'Maintainer', 'Instructor', 'User'].includes(role.role.name);

      return !isSystemRole;
    });

    return customRoles.map((role: any) => ({
      name: role.role.name || t('roles.custom_role'),
      description: role.role.description
    }));
  }, [userRoles, org?.id]);

  return (
    <div className="flex items-stretch items-center">
      {session.status == 'unauthenticated' && (
        <div className="flex items-stretch grow items-center">
          <ul className="flex space-x-0.5 sm:space-x-1 items-center">
            <li>
              <LanguageSwitcher primaryColor={primaryColor} />
            </li>
            <li>
              <Link
                className={`px-3 py-2 rounded-lg transition-colors text-sm font-bold ${colors.hoverBg} ${colors.text}`}
                href={getUriWithOrg(org?.slug, '/login')} >{t('auth.login')}</Link>
            </li>
            <li className={`rounded-lg shadow-sm transition-colors px-4 py-2 text-xs sm:text-sm font-bold ml-1 sm:ml-2 ${colors.signUpBtn}`}>
              <Link href={getUriWithOrg(org?.slug, '/signup')}>{t('auth.sign_up')}</Link>
            </li>
          </ul>
        </div>
      )}
      {session.status == 'authenticated' && (
        <div className="flex items-center space-x-0">
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="
    group cursor-pointer flex items-center space-x-3 rounded-lg p-2 transition-colors
    bg-white text-black
    hover:bg-[#059669] hover:text-white
    data-[state=open]:bg-[#059669] data-[state=open]:text-white
  "
                >
                  <UserAvatar border="border-2" rounded="rounded-lg" width={30} shadow={primaryColor ? '' : undefined} />
                  <div className="flex flex-col items-start space-y-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold capitalize text-black group-hover:text-white data-[state=open]:text-white">
                        {session.data.user.username}
                      </p>
                      {userRoleInfo && userRoleInfo.name !== 'USER' && (
                        <Tooltip
                          content={userRoleInfo.description}
                          sideOffset={15}
                          side="bottom"
                        >
                          <div className={`text-[6px] ${userRoleInfo.bgColor} ${userRoleInfo.textColor} px-1 py-0.5 font-medium rounded-full flex items-center gap-0.5 w-fit`}>
                            {userRoleInfo.icon}
                            {userRoleInfo.name}
                          </div>
                        </Tooltip>
                      )}
                      {/* Custom roles */}
                      {customRoles.map((customRole, index) => (
                        <Tooltip
                          key={index}
                          content={customRole.description || `${t('roles.custom_role')}: ${customRole.name}`}
                          sideOffset={15}
                          side="bottom"
                        >
                          <div className="text-[6px] bg-gray-500 text-white px-1 py-0.5 font-medium rounded-full flex items-center gap-0.5 w-fit">
                            <Shield size={12} weight="fill" />
                            {customRole.name}
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-white data-[state=open]:text-white">
                      {session.data.user.email}
                    </p>
                  </div>
                  <CaretDown size={16} weight="fill" className="text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white text-black" align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-2">
                    <UserAvatar border="border-2" rounded="rounded-full" width={24} />
                    <div>
                      <p className="text-sm font-semibold capitalize text-black group-hover:text-white data-[state=open]:text-white">
                        {session.data.user.username}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-white data-[state=open]:text-white">
                        {session.data.user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-gray-200" />
                {rights?.dashboard?.action_access && (
                  <DropdownMenuItem asChild>
                    <Link href="/dash" className="flex items-center space-x-2 text-black">
                      <Shield size={16} weight="fill" className="text-black" />
                      <span>{t('common.dashboard')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/account/general" className="flex items-center space-x-2 text-black">
                    <User size={16} weight="fill" className="text-black" />
                    <span>{t('user.user_settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/my-courses" className="flex items-center space-x-2 text-black">
                    <Package size={16} weight="fill" className="text-black" />
                    <span>{t('courses.my_courses')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-200" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center space-x-2 text-black">
                    <Globe size={14} weight="fill" className="text-black" />
                    <span>{t('common.language')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {AVAILABLE_LANGUAGES.map((language) => (
                        <DropdownMenuItem
                          key={language.code}
                          onClick={() => changeLanguage(language.code)}
                          className="flex items-center justify-between text-black"
                        >
                          <span>{t(language.translationKey)} ({language.nativeName})</span>
                          {i18n.language === language.code && <Check size={14} weight="bold" className="text-black" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="border-gray-200" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2 text-black"
                >
                  <SignOut size={16} weight="fill" className="text-black" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}

