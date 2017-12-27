export  { SpriteType, Sprite, SpriteSet };

import * as Data from "./../../Data/Data";
import * as Math from "./../../Mathematics/Mathematics";

import { DrawObject, DrawObjectType } from "./DrawObject";

enum SpriteType
{
    Default = 0,
    Lit = 1
}
class Sprite extends DrawObject
{
    private _CurrentIndex:number;
    private _CurrentSpriteSet:number;
    private _BackUpSpriteSet:number;
    private _Paint:Math.Color;
    private _SpriteType:SpriteType;
    private _SpriteSets:SpriteSet[];
    private _SubSprites:Sprite[];
    public get BackUpSpriteSet():number { return this._BackUpSpriteSet; }
    public set BackUpSpriteSet(value:number) { this._BackUpSpriteSet = value; }
    public get CurrentIndex():number { return this._CurrentIndex; }
    public get CurrentSpriteSet():number { return this._CurrentSpriteSet; }
    public get Paint():Math.Color { return this._Paint; }
    public set Paint(value:Math.Color) { this._Paint = value; }
    public get SpriteType():SpriteType { return this._SpriteType; }
    public set SpriteType(value:SpriteType) { this._SpriteType = value; }
    public get SpriteSets():SpriteSet[] { return this._SpriteSets; }
    public set SpriteSets(value:SpriteSet[]) { this._SpriteSets = value; }
    public get SubSprites():Sprite[] { return this._SubSprites; }
    public set SubSprites(value:Sprite[]) { this._SubSprites = value; }
    public constructor(Old?:Sprite)
    {
        super(Old);
        this.DrawType = DrawObjectType.Sprite;
        this._CurrentIndex = 0;
        this._CurrentSpriteSet = 0;
        this._BackUpSpriteSet = -1;
        this._SpriteType = SpriteType.Default;
        if(Old != null)
        {
            this._SpriteSets = Old._SpriteSets;
            this._SubSprites = [];
            for(let i = 0; i < Old._SubSprites.length; i++) this._SubSprites.push(Old._SubSprites[i].Copy());
            this.Trans.Scale = Old.Trans.Scale.Copy();
            this._Paint = Old._Paint.Copy();
        }
        else
        {
            this._SpriteSets = [];
            this._SubSprites = [];
            this.Trans.Scale = new Math.Vertex(100, 100, 1);
            this._Paint = Math.Color.FromRGBA(255, 255, 255, 255);
        }
    }
    public Copy() : Sprite
    {
        let New:Sprite = new Sprite(this);
        return New;
    }
    public CollectiveList() : string[]
    {
        let List:string[] = [];
        for(let i = 0; i < this._SpriteSets.length; i++)
        {
            for(let j = 0; j < this._SpriteSets[i].Sprites.length; j++)
            {
                List.push(this._SpriteSets[i].Sprites[j]);
            }
        }
        return List;
    }
    public RaiseIndex() : void
    {
        this._CurrentIndex++;
        if (this._SpriteSets.length <= 0) this._CurrentIndex = -1;
        else if (this._CurrentIndex >= this._SpriteSets[this._CurrentSpriteSet].Sprites.length)
        {
            this.Events.Invoke("SpriteSetAnimationComplete", null, {CurrentSpriteSet:this._CurrentSpriteSet, NextSpriteSet:((this._BackUpSpriteSet!=-1)?this._BackUpSpriteSet:this._CurrentSpriteSet)});
            if (this._BackUpSpriteSet != -1)
            {
                this._CurrentSpriteSet = this._BackUpSpriteSet;
                this._BackUpSpriteSet = -1;
            }
            this._CurrentIndex = 0;
        }
    }
    public SetSpriteSet(Index:number) : void
    {
        if (Index >= this._SpriteSets.length) return;
        this._CurrentSpriteSet = Index;
        this._CurrentIndex = 0;
    }
    public UpdateSpriteSet(Index:number) : void
    {
        if(Index != this._CurrentSpriteSet) this.SetSpriteSet(Index);
    }
    public SetSpriteSetByName(Name:string) : void
    {
        for(let i = 0; i < this._SpriteSets.length; i++)
        {
            if(this._SpriteSets[i].Name == Name) this.SetSpriteSet(i);
        }
    }
    public UpdateSpriteSetByName(Name:string) : void
    {
        for(let i = 0; i < this._SpriteSets.length; i++)
        {
            if(this._SpriteSets[i].Name == Name) this.UpdateSpriteSet(i);
        }
    }
    public Index() : number
    {
        let Index:number = 0;
        for(let i = 0; i < this._CurrentSpriteSet; i++)
        {
            Index += this._SpriteSets[i].Sprites.length;
        }
        Index += this._CurrentIndex;
        return Index;
    }
    public GetActiveSprites() : string[]
    {
        if(this._SpriteSets.length == 0) return [];
        return this._SpriteSets[this._CurrentSpriteSet].Sprites;
    }
    public GetSprites(Set:number) : string[]
    {
        if(this._SpriteSets.length == 0) return [];
        return this._SpriteSets[Set].Sprites;
    }
    public Serialize() : any
    {
        // Override
        let S = super.Serialize();
        S.Paint = this._Paint.Serialize();
        S.SpriteSets = [];
        for(let i in this._SpriteSets)
        {
            S.SpriteSets.push(this._SpriteSets[i].Serialize());
        }
        S.SubSprites = [];
        for(let i in this._SubSprites)
        {
            S.SubSprites.push(this._SubSprites[i].Serialize());
        }
        return S;
    }
    public Deserialize(Data:any) : void
    {
        // Override
        super.Deserialize(Data);
        this._Paint.Deserialize(Data.Paint);
        for(let i in Data.SpriteSets)
        {
            let SS:SpriteSet = new SpriteSet();
            SS.Deserialize(Data.SpriteSets[i]);
        }
        for(let i in Data.SubSprites)
        {
            let SS:Sprite = new Sprite();
            SS.Deserialize(Data.SubSprites[i]);
        }
    }
}
class SpriteSet
{
    private _ID:string;
    private _Name:string;
    private _Seed:number;
    private _Sprites:string[];
    public get ID():string { return this._ID; }
    public get Name():string { return this._Name; }
    public set Name(value:string) { this._Name = value; }
    public get Seed():number { return this._Seed; }
    public set Seed(value:number) { this._Seed = value; }
    public get Sprites():string[] { return this._Sprites; }
    public set Sprites(value:string[]) { this._Sprites = value; }
    public constructor(Old?:SpriteSet, Name?:string, Images?:string[])
    {
        if(Old != null)
        {
            this._ID = Data.Uuid.Create();
            this._Name = Old._Name;
            this._Seed = Old._Seed;
            this._Sprites = Old._Sprites;
        }
        else
        {
            this._ID = Data.Uuid.Create();
            if(Name != null) this._Name = Name;
            else this._Name = "";
            this._Seed = -1;
            if(Images) this._Sprites = Images;
            else this._Sprites = [];
        }
    }
    public Copy() : SpriteSet
    {
        let New:SpriteSet = new SpriteSet(this);
        return New;
    }
    public Serialize() : any
    {
        let SS = 
        {
            ID: this._ID,
            Name: this._Name,
            Seed: this._Seed,
            Sprites: this._Sprites
        };
        return SS;
    }
    public Deserialize(Data:any) : void
    {
        this._ID = Data.ID;
        this._Name = Data.Name;
        this._Seed = Data.Seed;
        this._Sprites = Data.Sprites;
    } 
}