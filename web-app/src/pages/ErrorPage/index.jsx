/* eslint-disable react/no-unescaped-entities */
/** **********************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
*********************************************************************** */

import React from 'react';
import {
  AppLayout,
  HelpPanel,
  Grid,
  Box,
  TextContent,
  Icon,
} from '@cloudscape-design/components';
import Sidebar from '../../common/components/Sidebar';

import { ExternalLinkItem } from '../../common/common-components-config';

import '../../common/styles/intro.scss';
import '../../common/styles/servicehomepage.scss';

// Image imports
import awsLogo from '../../public/images/AWS_logo_RGB_REV.png';

const ErrorPage = () => {
  return (
    <AppLayout
      navigation={<Sidebar activeHref="#/" />}
      content={<Content />}
      tools={<ToolsContent />}
      headerSelector="#h"
      disableContentPaddings
    />
  );
};

export default ErrorPage;

const Content = () => {
  return (
    <div>
      <TextContent>
        <div>
          <Grid className="custom-home__header" disableGutters>
            <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
              <Box margin={{ bottom: 's' }}>
                <img
                  src={awsLogo}
                  alt=""
                  style={{ maxWidth: '20%', paddingRight: '2em' }}
                />
              </Box>
              <div className="custom-home__header-title">
                <Box fontSize="display-l" fontWeight="bold" color="inherit">
                  404
                </Box>
                <Box
                  fontSize="display-l"
                  padding={{ bottom: 's' }}
                  fontWeight="light"
                  color="inherit"
                >
                  Page not found.
                </Box>
                <Box fontWeight="light">
                  <span className="custom-home__header-sub-title">
                    You've gone where <i>no man has gone before</i>.
                    <br />
                    <br />
                    Click <a href="/">here</a> to find your way back home.
                  </span>
                </Box>
              </div>
            </Box>
          </Grid>
        </div>
      </TextContent>
    </div>
  );
};

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>ErrorPage</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
          <li>
            <ExternalLinkItem
              href="https://github.com/maxtybar"
              text="Max Tybar's GitHub Repo"
            />
          </li>
        </ul>
      </>
    }
  >
    {/* TODO - Change href to /dashboard page once it is created */}
    <p>
      You've reached this page by mistake. <a href="/">Click here</a> to
      go home.
    </p>
  </HelpPanel>
);
