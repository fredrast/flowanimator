import React from 'react';
import OpenIcon from './assets/open.svg';
import './info.css';

export default function Info(props) {
  const openIconStyle = {
    height: '10px',
    width: '10px',
  };

  if (props.visible) {
    return (
      <div id="info-modal" className="modal">
        <div id="info-modal-content" className="modal-content">
          <div className="modal-header">
            <span
              id="btnClose"
              onClick={() => {
                props.setShowInfo(false);
              }}
            >
              &times;
            </span>
          </div>
          <div id="info-modal-body">
            <h1>Welcome to Flow Animator!</h1>
            <h2>About</h2>
            <span>
              {' '}
              The aim of the Flow Animator is to give you a new perspective to
              your professional workflows in Jira (product development, service
              desk, incident management management, etc) by providing an
              animated view of the flow of issues through the workflow statuses
              over time.{' '}
            </span>
            <br />{' '}
            <span>
              This tool has been built by Fredrik Åström (fredrik.astrom@iki.fi,
              @fredrast) as a hobby project (and exercise for learning front-end
              development), with the aim to explore what kind of insights can be
              gained by seeing the workflow as an animation. Please feel free to
              use this tool, and let me know how it works for you!
            </span>
            <br />
            <br />
            <h2>Usage</h2>
            <span>
              {' '}
              <b>1. Click Open</b> ({' '}
              <img
                src={OpenIcon}
                className={'icon'}
                alt={'open'}
                style={openIconStyle}
              />{' '}
              ) and enter credentials for logging in to a Jira server: <br />{' '}
              <ul>
                <li>
                  <b>Jira server:</b> URL for a Jira Cloud or Jira Server
                  (on-premise) instance{' '}
                </li>
                <li>
                  <b>CORS proxy:</b> Option for dealing with CORS (see below){' '}
                </li>
                <li>
                  <b>User ID:</b> Your user ID for the Jira instance{' '}
                </li>
                <li>
                  <b>Password or API token:</b> For Jira Cloud, you need to{' '}
                  <a
                    href="https://confluence.atlassian.com/cloud/api-tokens-938839638.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    generate an API token
                  </a>{' '}
                  and enter it here. For Jira Server, enter your normal
                  password.
                </li>
              </ul>
              NB These credentials will not be stored anywhere. They will be
              used for authenticating against a Jira server to retrieve data for
              the animation. They will remain in the memory of the browser
              during your session and will be discarded when you close the
              browser session. Likewise, any data retrieved from Jira will only
              exist in the browser session of your local workstation and will
              not be stored permanently anywhere.
            </span>
            <br />
            <span>
              <b>2. Click Next</b> (and wait a while...)
            </span>
            <span>
              <b>3. Select a Jira board</b> for which to run the animation. The
              app will retrieve the stories from Jira that match the filter of
              the selected board and generate an animation of the stories'
              status transitions over time. The statuses will be mapped to
              columns in accordance to the mapping logic defined for the
              selected board in Jira.
            </span>
            <span>
              <b>4. Click Go</b> (and wait a few moments more...).
            </span>{' '}
            <br />
            <span>
              <b>5. Use the play controls</b> to playback the animation of the
              stories' transitions. The slider bar can be used for quickly
              moving forwards and backwards.
            </span>
            <span>
              <b>6. Click on the stories</b> to see some further data, such as
              cycle and lead times, and times spent in statuses. The coloring
              (red) of the issues reflect their age since the moment they got
              committed for implementation. This is assumed to happen when the
              ticket moves from the first column to the second. Maximum age
              coloring is reached at 30 days. This is currently hard-coded but
              likely to be configurable in the future.
            </span>
            <br />
            <br />
            <br />
            <h2>Dealing with CORS</h2>
            <span>
              Due to the{' '}
              <a
                href="https://en.wikipedia.org/wiki/Same-origin_policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Same-Origin Security Policy
              </a>{' '}
              that browsers are nowadays implementing, some special arrangements
              are needed to make it possible to load data from a different
              domain (the domain of your Jira instance) than the one that served
              the application (herokuapp.com). The options are as follows:
              <ol>
                {' '}
                <li>
                  <b>Heroku</b> - Choose this to use Flow Animator's own CORS
                  gatewey on Heroku. In this case, the communication between
                  your browser and Jira will looop through a server process on
                  Heroku, but no credentials or data will be stored on Heroku.
                  NB this option will not work if your Jira server is behind a
                  corporate firewall, unless you make an opening for requests
                  from <u>flowanimator.herokuapp.com</u>.
                </li>
                <li>
                  <b>localhost</b> - Choose this if you instead run the{' '}
                  <a
                    href="https://www.npmjs.com/package/cors-anywhere"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    cors-anywhere
                  </a>{' '}
                  CORS proxy on your local workstation. In this case you also
                  need to supply the port number, which by default is 8080.
                </li>
                <li>
                  <b>None</b> - Choose this if you use some other way of dealing
                  with CORS, such as
                  <ul>
                    <li>
                      whitelisting <u>flowanimator.heokuapp.com</u> in your Jira
                      server configuration
                    </li>
                    <li>
                      including the URL of a CORS proxy directly in the server
                      URL
                    </li>
                    <li>using a browser plugin to bypass CORS</li>
                  </ul>
                </li>
              </ol>
            </span>
            <br />
            <br />
            <h2>Comments and suggestions appreciated!</h2>
            <span>
              Happy exploring! Please provide any comments, questions, bug
              reports, or suggestions for new features to fredrik.astrom@iki.fi
              !
            </span>
          </div>{' '}
        </div>
      </div>
    );
  } else {
    return null;
  }
}
