import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as fs from 'fs';
import * as path from 'path';
import { MemoryRouter } from 'react-router-dom';

import Http from '../http/Http';
jest.mock('../http/Http'); // this overriddes /src/http/Http with what's inside /src/http/__mocks__/Http.tsx
import IssueList from './IssueList';

it('renders without crashing', () => {
  // By default, all our http is successful with an empty response body
  const div = document.createElement('div');
  ReactDOM.render((
    <MemoryRouter initialEntries={['/legislators']}>
      <IssueList />
    </MemoryRouter>
  ), div);
});

it('renders with some legislators', () => {
  // this test requires the following mock data files to exist:
  let legislatorFilePath = path.resolve(__dirname, '../__mock_data__/issues_get_200.json');
  fs.exists(legislatorFilePath, (exists: boolean) => { expect(exists).toBe(true); });
  //
  // tslint:disable-next-line:no-any
  Http.prototype.get = jest.fn().mockImplementation((url: string, options: any) => {
    // TODO: conditionally respond with legislator data
    let validGetResponse: Response = new Response(fs.readFileSync(legislatorFilePath, 'utf8'), { 'status' : 200});
    return {
      // note, no need to mock the returned req field since we don't use it
      resp: new Promise<Response>((resolve, reject) => {
        resolve(validGetResponse);
      })
    };
  });

  const div = document.createElement('div');
  ReactDOM.render((
    <MemoryRouter initialEntries={['/']}>
      <IssueList />
    </MemoryRouter>
  ), div);
  expect(Http.prototype.get).toHaveBeenCalledTimes(1);
  expect(Http.prototype.get).toHaveBeenCalledWith('/api/issues');
});
