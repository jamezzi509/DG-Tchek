// @vitest-environment jsdom
import {it,expect,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import RundownPanel from './RundownPanel';
afterEach(cleanup);
it('allows switching to whole Pick4 and entering a known source',()=>{render(<RundownPanel/>);fireEvent.change(screen.getByLabelText('Kalite rundown'),{target:{value:'4'}});fireEvent.change(screen.getByLabelText('Nimewo rundown'),{target:{value:'8984'}});expect(screen.getByText('15 · 26 · 56 · 67')).toBeTruthy();expect(screen.getByText('4 boul komen')).toBeTruthy();fireEvent.change(screen.getByLabelText('Kalite rundown'),{target:{value:'split'}});expect((screen.getByLabelText('Nimewo rundown') as HTMLInputElement).value).toBe('');});
