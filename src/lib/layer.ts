import * as path from 'path';
import { LayerVersion, Runtime, RuntimeFamily, Code } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import { artifactsHash } from './utils';

export interface WranglerLayerProps {
  readonly version?: string;
}

export class WranglerLayer extends LayerVersion {
  constructor(scope: Construct, id: string, props?: WranglerLayerProps) {
    const version = props?.version ?? '2.7.0';
    const wranglerLayerZip = `https://github.com/awslabs/aws-data-wrangler/releases/download/${version}/awswrangler-layer-${version}-py3.8.zip`;

    super(scope, id, {
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      code: Code.fromAsset(path.join(__dirname, '../lambda.d/layer.d/awswrangler'), {
        bundling: {
          image: new Runtime('busybox', RuntimeFamily.OTHER, {
            bundlingDockerImage: 'public.ecr.aws/runecast/busybox:1.32.1',
          }).bundlingImage,
          command: [
            'sh',
            '-c',
            `
                mkdir -p /asset-output/ &&
                wget -qO- ${wranglerLayerZip} | unzip - -d /asset-output
                `,
          ],
        },
        assetHash: artifactsHash([wranglerLayerZip]),
      }),
      description: `wrangler-${version}`,
    });
  }
}