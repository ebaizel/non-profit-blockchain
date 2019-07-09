/*
# Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# A copy of the License is located at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# or in the "license" file accompanying this file. This file is distributed 
# on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
# express or implied. See the License for the specific language governing 
# permissions and limitations under the License.
#
*/

// Register and enroll a user.  Persists secrets in AWS Parameter Store

const fs = require("fs");
const path = require('path');
const Fabric_Client = require('fabric-client');
const awsParamStore = require( 'aws-param-store' );

const log4js = require('log4js');
const logger = log4js.getLogger('register');

const AMB_NETWORK_ID = process.env.AMB_NETWORK_ID || 'n-GP2SWUTYORACDCZOSA7MDQC5RA';

function getAdminUserKey() {
    return 'amb.' + AMB_NETWORK_ID + '.admin.username';
}

function getAdminPasswordKey() {
    return 'amb.' + AMB_NETWORK_ID + '.admin.password';
}

function getUserPasswordKey(username) {
    return 'amb.' + AMB_NETWORK_ID + '.user.' + username + '.password.';
}

// Helper function to get admin user info
async function getAdminInfo() {
    return awsParamStore.getParameters([getAdminPasswordKey(), getAdminUserKey()], { region: 'us-east-1' } )
    .then( (parameters) => {
        return {
            password: parameters.Parameters[0].Value,
            username: parameters.Parameters[1].Value
        };
    })
}

async function setAdminContext(client) {
    const {username, password} = await getAdminInfo();
    return await client.setUserContext({username, password});
}

async function putUserInfo(username, secret) {
    await awsParamStore.putParameter(getUserPasswordKey(username), secret, "SecureString", { region: 'us-east-1' });
}

async function setupCrypto(client) {
    var store_path = path.join(__dirname, 'hfc-key-store');
    return Fabric_Client.newDefaultKeyValueStore({ path: store_path }).then(async (state_store) => {
        client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
        crypto_suite.setCryptoKeyStore(crypto_store);
        client.setCryptoSuite(crypto_suite);
    });
}

async function setupNetwork(client) {
    client.loadFromConfig('./config/ngo-connection-profile.yaml');
    client.loadFromConfig('./config/client-org.yaml');
}

module.exports.run = async (event)  =>  {
    const fabric_client = new Fabric_Client();
    await setupCrypto(fabric_client);
    await setupNetwork(fabric_client);

    const adminUserObj = await setAdminContext(fabric_client);
    const caClient = fabric_client.getCertificateAuthority();

    // let newUser_username = event.username || 'daisy';
    const newUser_username = 'susie21';
    const secret = await caClient.register({
        enrollmentID: newUser_username
    }, adminUserObj);

    await putUserInfo(newUser_username, secret);

    return {
        success: true,
        secret,
        message: newUser_username + ' enrolled successfully',
    };
};   