import FlexSearch, { Charset, Document, Encoder, Index,IndexedDB } from 'flexsearch';
import { store } from '../db/store';
import type { FrontendTodo } from '../types/store';
import type { Row } from 'tinybase';

export class SearchingService {
    private index = new Index({ encoder: Charset.CJK });
    private db =  new IndexedDB("myTodoIndexDB");

  public initialize() {
    this.index.mount(this.db);
    console.log('Initializing FlexSearch index...');
  }

  public search(term: string) {
    const res = this.index.search(term, {suggest: true}) as string[];
    return res;
  }

  public update(tableId: string, rowId: string) {
    const todo = store.getRow(tableId, rowId) as unknown as FrontendTodo;
    if(todo.syncStatus === 'pending_delete') {
        this.index.remove(rowId);
        console.log(`Removed todo from index: ${rowId}`);
    }else if(this.index.contain(rowId)){
        this.index.update(rowId, this.buildDocument(todo));
    }else{
        this.index.add(rowId, this.buildDocument(todo));
    }
  }

  private buildDocument(todo: FrontendTodo):string {
    return `${todo.title} ${todo.description}`;
  }
}
export const ss = new SearchingService();