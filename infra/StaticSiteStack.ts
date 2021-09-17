import {
  App,
  ReactStaticSite,
  Stack,
  StackProps,
} from "@serverless-stack/resources";

interface StaticSiteStackProps extends StackProps {
  readonly ApiEndpoint: string;
}

export default class StaticSiteStack extends Stack {
  constructor(scope: App, id: string, props: StaticSiteStackProps) {
    super(scope, id, props);

    new ReactStaticSite(this, "ReactSite", {
      environment: {
        REACT_APP_API_URL: props.ApiEndpoint,
      },
      path: "apps/hello-static-site",
    });
  }
}
