// 'use client'

// import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
// import { getUriWithOrg, getAPIUrl } from '@services/config/config'
// import { getCourseThumbnailMediaDirectory } from '@services/media/media'
// import Link from 'next/link'
// import React from 'react'
// import { useTranslation } from 'react-i18next'
// import { useLHSession } from '@components/Contexts/LHSessionContext'
// import { useOrg } from '@components/Contexts/OrgContext'
// import PageLoading from '@components/Objects/Loaders/PageLoading'
// import useSWR from 'swr'
// import { swrFetcher } from '@services/utils/ts/requests'

// const CollectionClient = ({ orgslug, collectionid }: { orgslug: string; collectionid: string }) => {
//   const { t } = useTranslation()
//   const session = useLHSession() as any
//   const access_token = session?.data?.tokens?.access_token
//   const org = useOrg() as any

//   const { data: col, error } = useSWR(
//     collectionid && access_token ? [`collections/collection_${collectionid}`, access_token] : null,
//     ([, token]) => swrFetcher(`${getAPIUrl()}collections/collection_${collectionid}`, token)
//   )

//   const removeCoursePrefix = (courseid: string) => {
//     return courseid.replace('course_', '')
//   }

//   if (!col) return <PageLoading />
// console.log('Rendering CollectionClient with collection:', col)
//   return (
//     <GeneralWrapperStyled>
//       <h2 className="text-sm font-bold text-gray-400">{t('collections.collection')}</h2>
//       <h1 className="text-3xl font-bold">{col.name}</h1>
//       <br />
//       <div className="home_courses flex flex-wrap">
//         {col.courses.map((course: any) => (
//           <div className="pr-8" key={course.course_uuid}>
//             <Link
//               href={getUriWithOrg(
//                 orgslug,
//                 '/course/' + removeCoursePrefix(course.course_uuid)
//               )}
//             >
//               <div
//                 className="inset-0 ring-1 ring-inset ring-black/10 rounded-lg shadow-xl relative w-[249px] h-[131px] bg-cover"
//                 style={{
//                   backgroundImage: `url(${course.thumbnail_image
//                     ? getCourseThumbnailMediaDirectory(
//                         org.org_uuid,
//                         course.course_uuid,
//                         course.thumbnail_image
//                       )
//                     : '/empty_thumbnail.png'
//                   })`,
//                 }}
//               ></div>
//             </Link>
//             <h2 className="font-bold text-lg w-[250px] py-2">{course.name}</h2>
//           </div>
//         ))}
//       </div>
//     </GeneralWrapperStyled>
//   )
// }

// export default CollectionClient

'use client'

import GeneralWrapperStyled from '@components/Objects/StyledElements/Wrappers/GeneralWrapper'
import { getUriWithOrg, getAPIUrl } from '@services/config/config'
import { getCourseThumbnailMediaDirectory } from '@services/media/media'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import PageLoading from '@components/Objects/Loaders/PageLoading'
import useSWR from 'swr'
import { swrFetcher } from '@services/utils/ts/requests'

const CollectionClient = ({ orgslug, collectionid }: { orgslug: string; collectionid: string }) => {
  const { t } = useTranslation()
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token
  const org = useOrg() as any

  const { data: col, error, isLoading } = useSWR(
    access_token
      ? [`collections/collection_${collectionid}`, access_token]
      : null,
    ([, token]) =>
      swrFetcher(`${getAPIUrl()}collections/collection_${collectionid}`, token),
    {
      shouldRetryOnError: false,
    }
  )

  const removeCoursePrefix = (courseid: string) => {
    return courseid.replace('course_', '')
  }

  // ✅ Loading state
  if (isLoading) return <PageLoading />

  // ✅ Unauthorized or not logged in → show message
  const isUnauthorized =
    !access_token ||
    error?.message === 'UNAUTHORIZED' ||
    error?.status === 401 ||
    error?.status === 409

  if (isUnauthorized) {
    return (
      <GeneralWrapperStyled>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Sign in required
          </h2>

          <p className="text-gray-500 mb-6 max-w-md">
            You need to sign in to view this collection and access its courses.
          </p>

          <Link
            href={`/login?redirect=/collections/${collectionid}`}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        </div>
      </GeneralWrapperStyled>
    )
  }

  // ✅ Other error
  if (error) {
    return <div>Failed to load collection</div>
  }

  // ✅ No data fallback
  if (!col) return <div>No collection found</div>

  return (
    <GeneralWrapperStyled>
      <h2 className="text-sm font-bold text-gray-400">
        {t('collections.collection')}
      </h2>
      <h1 className="text-3xl font-bold">{col.name}</h1>
      <br />
      <div className="home_courses flex flex-wrap">
        {col.courses.map((course: any) => (
          <div className="pr-8" key={course.course_uuid}>
            <Link
              href={getUriWithOrg(
                orgslug,
                '/course/' + removeCoursePrefix(course.course_uuid)
              )}
            >
              <div
                className="inset-0 ring-1 ring-inset ring-black/10 rounded-lg shadow-xl relative w-[249px] h-[131px] bg-cover"
                style={{
                  backgroundImage: `url(${
                    course.thumbnail_image
                      ? getCourseThumbnailMediaDirectory(
                          org.org_uuid,
                          course.course_uuid,
                          course.thumbnail_image
                        )
                      : '/empty_thumbnail.png'
                  })`,
                }}
              ></div>
            </Link>
            <h2 className="font-bold text-lg w-[250px] py-2">
              {course.name}
            </h2>
          </div>
        ))}
      </div>
    </GeneralWrapperStyled>
  )
}

export default CollectionClient