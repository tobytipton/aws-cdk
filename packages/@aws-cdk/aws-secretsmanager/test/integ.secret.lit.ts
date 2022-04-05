import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as secretsmanager from '../lib';

class SecretsManagerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    const role = new iam.Role(this, 'TestRole', { assumedBy: new iam.AccountRootPrincipal() });

    /// !show
    // Default secret
    const secret = new secretsmanager.Secret(this, 'Secret');
    secret.grantRead(role);

    const user = new iam.User(this, 'User', {
      password: secret.secretValue,
    });

    // Templated secret
    const templatedSecret = new secretsmanager.Secret(this, 'TemplatedSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'user' }),
        generateStringKey: 'password',
      },
    });

    new iam.User(this, 'OtherUser', {
      userName: templatedSecret.secretValueFromJson('username').toString(),
      password: templatedSecret.secretValueFromJson('password'),
    });

    // Secret with predefined value
    const accessKey = new iam.AccessKey(this, 'AccessKey', { user });
    new secretsmanager.Secret(this, 'PredefinedSecret', {
      secretStringBeta1: secretsmanager.SecretStringValueBeta1.fromToken(accessKey.secretAccessKey.toString()),
    });
    /// !hide
  }
}

const app = new cdk.App();
new SecretsManagerStack(app, 'Integ-SecretsManager-Secret');
app.synth();
