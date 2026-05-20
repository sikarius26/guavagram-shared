import { dynamicFromJS, dynamicToJSON } from '../api.client.shared'

export class UserByPhoneViewModel {
  userId!: string
  name!: string
  surname!: string

  static fromJS(data: any): UserByPhoneViewModel {
    data = typeof data === 'object' ? data : {}
    return dynamicFromJS(data, UserByPhoneViewModel, {})
  }

  toJSON() {
    return dynamicToJSON(this)
  }
}
