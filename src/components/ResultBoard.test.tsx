import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ResultBoard from './ResultBoard';
import { runDGTchek } from '../lib/core';
import { buildDatabase } from '../lib/database';
afterEach(cleanup);
it('limits favorites to three, filters BOX, expands straight and resets for a new comparison',()=>{
 localStorage.clear();
 const {rerender}=render(<ResultBoard result={runDGTchek('36','66',buildDatabase().db)}/>);
 expect(screen.queryByRole('button',{name:'4 Chif'})).toBeNull();
 for(const n of ['22','27','77'])fireEvent.click(screen.getByRole('button',{name:`Favori ${n}`}));
 expect((screen.getByRole('button',{name:'Favori 45'}) as HTMLButtonElement).disabled).toBe(true);
 expect(screen.queryByText('457',{exact:true})).toBeNull();
 expect(screen.getByText('227',{exact:true})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'3 Chif STRAIGHT'}));
 expect(screen.getByText('272',{exact:true})).toBeTruthy();
 expect(screen.queryByText('722',{exact:true})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Wè tout'}));
 expect(screen.getByText('457',{exact:true})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Favori 22'}));
 rerender(<ResultBoard result={runDGTchek('02','00',buildDatabase().db)}/>);
 expect(screen.queryByRole('button',{name:'Wè tout'})).toBeNull();
 expect(screen.getByText('111',{exact:true})).toBeTruthy();
});

it('copies only selected favorites and the currently displayed BOX or STRAIGHT list',async()=>{
 localStorage.clear();
 const writeText=vi.fn().mockResolvedValue(undefined);
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}});
 render(<ResultBoard result={runDGTchek('36','66',buildDatabase().db)}/>);
 for(const n of ['22','27','77'])fireEvent.click(screen.getByRole('button',{name:`Favori ${n}`}));
 fireEvent.click(screen.getByRole('button',{name:/Kopye favori yo/i}));
 expect(writeText).toHaveBeenLastCalledWith('22 27 77');
 fireEvent.click(screen.getByRole('button',{name:/Kopye BOX/i}));
 expect(writeText).toHaveBeenLastCalledWith('222 227 277 777');
 fireEvent.click(screen.getByRole('button',{name:'3 Chif STRAIGHT'}));
 fireEvent.click(screen.getByRole('button',{name:/Kopye STRAIGHT/i}));
 expect(writeText).toHaveBeenLastCalledWith('222 227 272 277 727 777');
});
