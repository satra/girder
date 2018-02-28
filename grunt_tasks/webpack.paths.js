/**
 * Copyright 2015 Kitware Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var path = require('path');

module.exports = {
    clients_web: path.resolve(__dirname, '../clients/web'),
    node_modules: path.resolve(__dirname, '../node_modules'),
    web_src: path.resolve(__dirname, '../clients/web/src'),
    web_built: path.resolve(__dirname, '../clients/web/static/built/'),
    plugins: path.resolve(__dirname, '../plugins')
};
