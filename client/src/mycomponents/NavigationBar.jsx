import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserContext } from '@/context/UserContext';
import { APP_NAME, isLoggedIn } from '@/utils/utils'
import { USER_ROLE, USER_STATUS } from '@/utils/enums'
import { handleLogout } from '@/middleware/Api'

const BASE_MENU = [
  { name: 'Home', href: '/' },
]

const LOGIN_MENU = [
  { name: 'Login', href: '/auth/login' },
]
const LOGGED_IN_MENU = [
  { name: 'Chat', href: '/chats' },
]

const PROFILE_MENU = [
  { name: 'Profile', href: '/profile' },
]

const PATIENT_MENU = [
  // { name: 'Experiment', href: '/participants/:id/experiments' },
  { name: 'Class', href: '/class' },
  { name: 'Budget', href: '/budget/transaction' },
  { name: 'Goals', href: '/goals' },
  { name: 'Task', href: '/tasks' },
  { name: 'Quiz', href: '/quizes/select' },
  // {
  //   name: 'Mood',
  //   href: '#',
  //   submenu: [
  //     {
  //       name: 'Calender',
  //       href: '/mood/calendar'
  //     },
  //     {
  //       name: 'Dashboard',
  //       href: '/mood/dashboard'
  //     }
  //   ],
  // },
  { name: 'Bionic', href: '/bionic/converter' },
]

const CARE_GIVER_MENU = [
  { name: 'Participants', href: '/participants?page=1' },
]

const ADMIN_MENU = [
  { name: 'Users', href: '/users?page=1' },
  { name: 'Budget', href: '/budget/type' },
  { name: 'Quiz', href: '/quizes/select' },
  // { name: 'Care Givers', href: '/caregivers?page=1' },
  // { name: 'Participants', href: '/participants?page=1' },
]

export default function Navbar() {
  const { user } = useUserContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const getmenuItems = () => {
    let items = [...BASE_MENU];

    if (isLoggedIn()) {
      items = [...items, ...LOGGED_IN_MENU];
    }

    if (user?.role === USER_ROLE.PATIENT) {
      items = [...items, ...PATIENT_MENU];
    }

    else if (user?.role === USER_ROLE.CARE_GIVER) {
      items = [...items, ...CARE_GIVER_MENU];
    }

    else if (user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.SUPER_ADMIN) {
      items = [...items, ...ADMIN_MENU];
    }

    return items;
  };

  const finalmenuItems = getmenuItems(user);

  return (
    <nav className="w-full shadow fixed top-0 z-50 md:py-1 bg-blue-900">
      {/* pc menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full justify-between">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-white">
                <div className='flex'>
                  <img src="/navbar/icon3.png" className="h-12 w-12" alt="logo" />
                  <p className='my-auto ml-2'>{APP_NAME}</p>
                </div>
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-2 lg:space-x-6 h-full items-center">
              {finalmenuItems.map((item, index) => (
                <div
                  key={index}
                  className="group relative"
                  onMouseEnter={() => setActiveMenu(index)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    to={item.href}
                    className="flex items-center gap-1.5 text-white transition-colors duration-300 hover:text-gray-300"
                  >
                    {item.name}
                    {item.submenu && <ChevronDown className="h-4 w-4" />}
                  </Link>

                  {item.submenu && activeMenu === index && (
                    <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-md bg-white py-2 shadow-lg dark:bg-gray-800">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block px-4 py-2 text-sm text-black"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center">
                {isLoggedIn() ?
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="max-h-[50%]">
                      <Button variant="ghost" className="text-white hover:text-primary/80 text-sm font-medium h-full bg-white"
                        style={{ color: 'rgb(24,62,139)' }}>
                        <p>{user.name}</p>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {PROFILE_MENU.map((menu, index) => (
                        <DropdownMenuItem asChild className="py-3 cursor-pointer" key={index}>
                          <Link to={menu.href} className="text-sm font-medium">{menu.name}</Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem asChild className="py-3 cursor-pointer w-[100%] text-right">
                        <Link to={null} className="text-sm font-medium" onClick={() => handleLogout()}>Logout</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  :
                  <Link to={LOGIN_MENU[0].href}
                    className="text-white text-primary inline-flex items-center px-3  py-2 h-full text-sm font-medium rounded-sm font-semibold bg-white hover:bg-gray-100"
                    style={{ color: 'rgb(24,62,139)' }}
                  >
                    {LOGIN_MENU[0].name}
                  </Link>
                }
              </div>
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden text-white ">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 h-full hover:bg-blue-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="text-white block h-6 w-6 " aria-hidden="true" />
              ) : (
                <Menu className="text-white block h-6 w-6 " aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="space-y-1 pb-3 pt-2 pl-4">
          {finalmenuItems.map((item, index) => (
            <div key={index} className='text-center'>
              {item.submenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className='ml-4'>
                    <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm text-white">
                      {item.name} <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.submenu.map((dropdownItem) => (
                      <DropdownMenuItem key={dropdownItem.name} asChild className="py-2">
                        <Link to={dropdownItem.href} className="text-sm font-medium">{dropdownItem.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to={item.href}
                  className="text-white block px-3 py-2 text-sm text-primary hover:bg-primary/10 hover:text-primary/80 font-semibold"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}

          <div className="flex items-center">
            {isLoggedIn() ?
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="max-h-[50%] mx-auto">
                  <Button variant="ghost" className="bg-white text-blue-900 hover:text-primary/80 text-sm font-medium h-full">
                    {/* <img src={user.image ? user.image : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                      className='h-10 aspect-square rounded-full' /> */}
                    {user.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PROFILE_MENU.map((menu, index) => (
                    <DropdownMenuItem asChild className="py-3 cursor-pointer" key={index}>
                      <Link to={menu.href} className="text-sm font-medium">{menu.name}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild className="py-3 cursor-pointer">
                    <Link to={null} className="text-sm font-medium" onClick={() => handleLogout()}>Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              :
              <Link to={LOGIN_MENU[0].href}
                className="text-white text-primary inline-flex items-center px-3  py-2 h-full text-sm font-medium rounded-sm font-semibold mx-auto bg-white"
                style={{ color: 'rgb(24,62,139)' }}
              >
                {LOGIN_MENU[0].name}
              </Link>
            }
          </div>
        </div>
      </div>
    </nav>
  )
}