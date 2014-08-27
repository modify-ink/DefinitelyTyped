// Type definitions for Rethinkdb 1.12
// Project: http://rethinkdb.com/
// Definitions by: Sean Hess <https://seanhess.github.io/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
// Reference: http://www.rethinkdb.com/api/#js
// TODO: Document manipulation and below

declare module "rethinkdb" {

  export function connect(host:ConnectionOptions, cb:(err:Error, conn:Connection)=>void);

  export function dbCreate(name:string):Operation<CreateResult>;
  export function dbDrop(name:string):Operation<DropResult>;
  export function dbList():Operation<string[]>;

  export function db(name:string):Db;
  export function table(name:string, options?:{useOutdated:boolean}):Table;

  export function asc(property:string):Sort;
  export function desc(property:string):Sort;

  export var count:Aggregator;
  export function sum(prop:string):Aggregator;
  export function avg(prop:string):Aggregator;
  export function and(...b:Expression<boolean>[]):Expression<boolean>;

  export function row(name:string):Expression<any>;
  export function expr(stuff:any):Expression<any>;

  export function now():Expression<Date>;
  export function time(year:number, month:number, day:number, hour?:number, minute?:number, second?:number, timezone?:string):Expression<Date>;
  export function epochTime(time:number):Expression<Date>;
  export function ISO8601(date:string):Expression<Date>;

  // Control Structures
  export function branch(test:Expression<boolean>, trueBranch:Expression<any>, falseBranch:Expression<any>):Expression<any>;


  export class Cursor {
    hasNext():boolean;
    each(cb:(err:Error, row:any)=>void, done?:()=>void);
    each(cb:(err:Error, row:any)=>boolean, done?:()=>void); // returning false stops iteration
    next(cb:(err:Error, row:any) => void);
    toArray(cb:(err:Error, rows:any[]) => void);
    close():void;
  }

  interface ConnectionOptions {
    host:string;
    port:number;
    db?:string;
    authKey?:string;
  }

  interface Connection {
    close():void;
    reconnect(cb:(err:Error, conn:Connection)=>void);
    use(dbName:string);
    addListener(event:string, cb:Function);
    on(event:string, cb:Function);
  }

  interface Db {
    tableCreate(name:string, options?:TableOptions):Operation<CreateResult>;
    tableDrop(name:string):Operation<DropResult>;
    tableList():Operation<string[]>;
    table(name:string, options?:GetTableOptions):Table;
  }

  interface TableOptions {
    primary_key?:string; // 'id'
    durability?:string; // 'soft'
    cache_size?:number;
    datacenter?:string;
  }

  interface GetTableOptions {
    useOutdated: boolean;
  }

  interface Writeable {
    update(obj:Object, options?:UpdateOptions):Operation<WriteResult>;
    replace(obj:Object, options?:UpdateOptions):Operation<WriteResult>;
    replace(expr:ExpressionFunction<any>):Operation<WriteResult>;
    delete(options?:UpdateOptions):Operation<WriteResult>;
  }

  interface Table extends Sequence {
    indexCreate(name:string, index?:ExpressionFunction<any>):Operation<CreateResult>;
    indexDrop(name:string):Operation<DropResult>;
    indexList():Operation<string[]>;

    insert(obj:any[], options?:InsertOptions):Operation<WriteResult>;
    insert(obj:any, options?:InsertOptions):Operation<WriteResult>;

    get(key:string):Expression<any>; // primary key
    get(key:Expression<string>):Expression<any>;
    getAll(key:any, index?:Index):Sequence; // without index defaults to primary key
    getAll(...keys:any[]):Sequence;
  }

  interface Expression<T> extends Writeable, Operation<T>  {
    (prop:string):Expression<any>; 
    match(str:string):Expression<Object>;
    contains(prop:string):Expression<boolean>;
    contains(prop:ExpressionFunction<boolean>):Expression<boolean>;

    and(b:boolean):Expression<boolean>;
    and(b:Expression<boolean>):Expression<boolean>;
    or(b:boolean):Expression<boolean>;
    or(b:Expression<boolean>):Expression<boolean>;
    eq(v:any):Expression<boolean>;
    ne(v:any):Expression<boolean>;
    not():Expression<boolean>;

    gt(value:T):Expression<boolean>;
    ge(value:T):Expression<boolean>;
    lt(value:T):Expression<boolean>;
    le(value:T):Expression<boolean>;

    add(n:number):Expression<number>;
    sub(n:number):Expression<number>;
    mul(n:number):Expression<number>;
    div(n:number):Expression<number>;
    mod(n:number):Expression<number>;

    hasFields(...fields:string[]):Expression<boolean>;

    default(value:T):Expression<T>;
    keys():Array<string>;

    // if it is an expression for an array
    append<U>(value:U):Expression<U[]>;
    prepend<U>(value:U):Expression<U[]>;
    difference<U>(array:Expression<U[]>):Expression<U[]>;
    setInsert<U>(value:U):Expression<U[]>;
    setUnion<U>(array:Expression<U[]>):Expression<U[]>;
    setIntersection<U>(array:Expression<U[]>):Expression<U[]>;
    setDifference<U>(array:Expression<U[]>):Expression<U[]>;
    insertAt<U>(index:number, value:U):Expression<U[]>;
    spliceAt<U>(index:number, array:Expression<U[]>):Expression<U[]>;
    deleteAt<U>(index:number, endIndex?:number):Expression<U[]>;
    changeAt<U>(index:number, value:U):Expression<U[]>;

    // Manipulation
    pluck(...props:any[]):Sequence;
    without(...props:any[]):Sequence;

    inTimezone(zone:string):Expression<Date>;
    timezone():Expression<string>;
    during(start:Expression<Date>, end:Expression<Date>, options?:any):Expression<boolean>;
    date():Expression<Date>;
    timeOfDay():Expression<number>;
    year():Expression<number>;
    month():Expression<number>;
    day():Expression<number>;
    dayOfWeek():Expression<number>;
    dayOfYear():Expression<number>;
    hours():Expression<number>;
    minutes():Expression<number>;
    seconds():Expression<number>;
    toISO8601():Expression<string>;
    toEpochTime():Expression<number>;
  }

  interface Sequence extends Expression<any> {
    (prop:string):Sequence;
    between(lower:any, upper:any, index?:Index):Sequence;
    merge(rql:MergeFunction):Sequence;
    merge(query:Expression<Object>):Sequence;
    filter(rql:ExpressionFunction<boolean>):Sequence;
    filter(rql:Expression<boolean>):Sequence;
    filter(obj:{[key:string]:any}):Sequence;
    max(rql:ExpressionFunction<any>):Sequence;
    max(attr:string):Sequence;

    // Join
    // these return left, right
    innerJoin(sequence:Sequence, join:JoinFunction<boolean>):Sequence;
    outerJoin(sequence:Sequence, join:JoinFunction<boolean>):Sequence;
    eqJoin(leftAttribute:string, rightSequence:Sequence, index?:Index):Sequence;
    eqJoin(leftAttribute:ExpressionFunction<any>, rightSequence:Sequence, index?:Index):Sequence;
    zip():Sequence;

    // Transform
    map(transform:ExpressionFunction<any>):Sequence;
    withFields(...selectors:any[]):Sequence;
    concatMap(transform:ExpressionFunction<any>):Sequence;
    orderBy(...keys:string[]):Sequence;
    orderBy(...sorts:Sort[]):Sequence;
    skip(n:number):Sequence;
    limit(n:number):Sequence;
    slice(start:number, end?:number):Sequence;
    nth(n:number):Expression<any>;
    indexesOf(obj:any):Sequence;
    isEmpty():Expression<boolean>;
    union(sequence:Sequence):Sequence;
    sample(n:number):Sequence;

    // Aggregate
    reduce(r:ReduceFunction<any>, base?:any):Sequence;
    count(value:any):Expression<number>;
    count(rql:ExpressionFunction<boolean>):Expression<number>;
    count():Expression<number>;
    distinct():Sequence;
    group(group:ExpressionFunction<any>):Sequence;
    ungroup():Sequence;
    sum(prop:string):Expression<number>;

    // Control Structures
    forEach(query:Operation<WriteResult>):Operation<WriteResult>;
    forEach(f:(doc:Expression<any>)=>Operation<WriteResult>):Operation<WriteResult>;
  }

  interface ExpressionFunction<U> {
    (doc:Expression<any>):Expression<U>; 
  }

  interface JoinFunction<U> {
    (left:Expression<any>, right:Expression<any>):Expression<U>; 
  }

  interface ReduceFunction<U> {
    (acc:Expression<any>, val:Expression<any>):Expression<U>;
  }

  interface MergeFunction {
    (doc:Expression<any>):MergeResult
  }

  interface InsertOptions {
    upsert?: boolean; // true
    durability?: string; // 'soft'
    returnVals?: boolean; // false
  }

  interface UpdateOptions {
    nonAtomic?: boolean;
    durability?: string; // 'soft'
    returnVals?: boolean; // false    
  }

  interface WriteResult {
    inserted: number;
    replaced: number;
    unchanged: number;
    errors: number;
    deleted: number;
    skipped: number;
    first_error: Error;
    generated_keys: string[]; // only for insert
    new_val: any;
    old_val: any;
  }

  interface JoinResult {
    left:any;
    right:any;
  }

  interface MergeResult {
    [key:string]: Sequence
  }

  interface CreateResult {
    created: number;
  }

  interface DropResult {
    dropped: number;
  }

  interface Index {
    index: string;
    left_bound?: string; // 'closed'
    right_bound?: string; // 'open'
  }



  interface Operation<T> {
   run(conn:Connection, cb:(err:Error, result:T)=>void); 
  }

  interface Aggregator {}
  interface Sort {}

  // http://www.rethinkdb.com/api/#js
  // TODO control structures
}
