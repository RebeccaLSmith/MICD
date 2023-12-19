import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SideNavigation, Badge } from '@cloudscape-design/components';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{ text: 'Multi Impairment Communication Device', href: '/' }}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          navigate(event.detail.href);
        }
      }}
      items={[
        {
          type: 'link',
          text: 'Home',
          href: '/',
        },
        {
          type: 'section',
          text: 'Getting Started',
          expanded: true,
          items: [
            {
              type: 'link',
              text: 'About MICD',
              href: '/getting-started',
            },
          ],
        },

        {
          type: 'section',
          text: 'Admin',
          expanded: true,
          items: [
            {
              type: 'link',
              text: 'Users',
              href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1',
              external: true,
            },
            {
              type: 'link',
              text: 'Groups',
              href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1',
              external: true,
            },
            {
              type: 'link',
              text: 'Edit App',
              href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1',
              external: true,
            },
          ],
        },
      ]}
    />
  );
};

export default Sidebar;
