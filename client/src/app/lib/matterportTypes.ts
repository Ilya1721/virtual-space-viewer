import { Vector3 } from "three";

export interface MP_SDK
{
  connect: () => Promise<MP_SDK>;
  Tag: Tag;
}

export interface MP_Window extends Window
{
  MP_SDK: MP_SDK
}

export interface TagDescription
{
  label: string,
  anchorPosition: Vector3,
  stemVector: Vector3
}

export interface Tag {
  add: (tag: TagDescription) => Promise<void>;
}