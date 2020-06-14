# Flow Animator

Gain a new perspective on your professional workflows in Jira (product development, service desk, incident management, or whatever you may be using Jira for) by watching an animation of your issues flowing through the workflow statuses over time.

The Flow Animator app is running on [flowanimator.herokuapp.com](https://flowanimator.herokuapp.com). You can run it against any instance of Jira that you have access to. A demo mode based on sample data is also available.

This has been my hobby project and exercise for learning JavaScript, CSS and React. I'm also curious to explore what can be learned from viewing professional workflows as animations. Please provide any comments, questions, bug reports, and possible suggestions for new features to [fredrik.astrom@iki.fi](mailto:fredrik.astrom@iki.fi).

## Usage

1. Click Open and enter credentials for logging in to a Jira server:

   - **Jira server:** URL for a Jira Cloud or Jira Server (on-premise) instance
   - **CORS proxy:** Option for dealing with CORS (see below)
   - **User ID:** Your user ID for the Jira instance
   - **Password or API token:** For Jira Cloud, you need to generate an API token and enter it here. For Jira Server, enter your normal password.

   NB These credentials will not be stored anywhere. They will be used for authenticating against a Jira server to retrieve data for the animation. They will remain in the memory of the browser during your session and will be discarded when you close the browser session. Likewise, any data retrieved from Jira will only exist in the browser session of your local workstation and will not be stored permanently anywhere.

1. Click Next (and wait a moment while retrieving a list of boards on the Jira server that you have access to)

1. Select a Jira board for which to run the animation. The app will retrieve the issues from Jira that match the filter of the selected board and generate an animation of the stories' status transitions over time. The statuses will be mapped to columns in accordance to the mapping logic defined for the selected board in Jira.

1. Click Go (and wait a few moments more while generating the animation of the issues on the selected board... any suggestions for how to optimize the generation of the animation mostly welcome!).

1. Use the play controls to playback the animation of the stories' transitions. Use the slider bar to jump to a specific
   date in the animation.

1. Click on a story to see some further data, such as cycle and lead times, and times spent in statuses. The coloring (red) of the issues reflect their age since the moment they got committed for implementation. This is assumed to happen when the ticket moves from the first column to the second. Maximum age coloring is reached at 30 days. This is currently hard-coded but likely to be configurable in the future.

## Dealing with CORS

Due to the [Same-Origin Security Policy](https://en.wikipedia.org/wiki/Same-origin_policy) that browsers nowadays implement, an application running in a browser is not allowed to load data from another origin than the one that the application was served from, unless the response from this other origin contains certain HTTP headers to signal to the browser that [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) should be allowed. This becomes an issue since the server where the app runs and the Jira server that we want to retrieve data from are on different origins. To make matters more complicated, the Jira Rest API does not by default provide any CORS headers. In Jira Server, it is possible to [whitelist an external origin](https://confluence.atlassian.com/adminjiraserver079/configuring-the-whitelist-950289162.html), which will enable CORS requests from that origin. In Jira Cloud, no such option is unfortunately available. CORS can also be enabled by routing requests through a CORS proxy that adds the necessary headers. This works well with Jira Cloud (and thus compensates for the lack of whitelisting) but is less straight-forward with Jira Server, which is typically hosted behind a firewall.

The options are thus as follows:

- **Heroku** - Choose this to route requests to Jira through Flow Animator's CORS proxy on Heroku, which will include the required response headers. The communication between your browser and Jira will looop through a server process on Heroku, but no credentials or data will be stored on Heroku.
- **localhost** - Choose this if you instead want to route the requests through a CORS proxy (presumably [cors-anywhere](https://www.npmjs.com/package/cors-anywhere) or another proxy with identical syntax) on your local workstation. This is the recommended option when you have to be inside a firewall to access the Jira server. In this case you also need to supply the port number, which by default is 8080.
- **None** - Choose this if you use some other way of dealing with CORS, such as
  - whitelisting flowanimator.heokuapp.com in your Jira server configuration
  - including the URL of a CORS proxy directly in the server URL
  - using a browser plugin to bypass CORS

Please do let me know if there are better ways still to deal with CORS than these!
