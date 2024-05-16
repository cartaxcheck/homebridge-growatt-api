import { Service, PlatformAccessory } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class BatteryAccessory {
  private service: Service;
  private currentStatus;

  private growatt = {
    api: require('growatt'),
    options: {}
  }

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  //public log;
  //public config;
  //public api;

  //public Service;
  private Characteristic;

  //public name;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    //this.log = log;
    //this.config = config;
    //this.api = api;

    //this.service = platform.api.hap.Service;
    this.service = (this.accessory.getService("SolarBattery") || this.accessory.addService(this.platform.Service.Battery, "SolarBattery", "SolarBattery"))
      .setCharacteristic(this.platform.Characteristic.Name, "Solar Battery")
      .setCharacteristic(this.platform.Characteristic.Model, "Solar Battery")
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Solar Battery")

    // extract name from config
    //this.name = config.name;

    // create a new Battery service
    //this.service = new this.Service(this.Service.Battery);

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.StatusLowBattery)
      .onGet(this.handleStatusLowBatteryGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.BatteryLevel)
      .onGet(this.handleBatteryLevelGet.bind(this))

    this.service.getCharacteristic(this.platform.Characteristic.ChargingState)
      .onGet(this.handleChargingStateGet.bind(this))


    // Example: add two "motion sensor" services to the accessory
    const isChargingFromGridStatus = (this.accessory.getService('Grid Charging') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'Grid Charging', "IsGridCharging"))
      .setCharacteristic(this.platform.Characteristic.Name, "Grid Charging")

    const hasSolarExcessStatus = (this.accessory.getService('Solar Excess') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'Solar Excess', "HasSolarExcess"))
        .setCharacteristic(this.platform.Characteristic.Name, "Solar Excess")

    const chargeLevelAsSensor = (this.accessory.getService('Charge Level') ||
      this.accessory.addService(this.platform.Service.HumiditySensor, 'Charge Level', "ChargeLevel"))
        .setCharacteristic(this.platform.Characteristic.Name, "Charge Level")

    const batteryChargeAsSensor = (this.accessory.getService('Battery Charge') ||
      this.accessory.addService(this.platform.Service.LightSensor, 'Battery Charge', "BatteryCharge"))
        .setCharacteristic(this.platform.Characteristic.Name, "Battery Charge")
    
    const batteryDischargeAsSensor = (this.accessory.getService('Battery Discharge') ||
      this.accessory.addService(this.platform.Service.LightSensor, 'Battery Discharge', "BatteryDischarge"))
        .setCharacteristic(this.platform.Characteristic.Name, "Battery Discharge")

    const pvPowerAsSensor = (this.accessory.getService('PV Power') ||
      this.accessory.addService(this.platform.Service.LightSensor, 'PV Power', "PVPower"))
        .setCharacteristic(this.platform.Characteristic.Name, "PV Power")

    const propertyLoadAsSensor = (this.accessory.getService('Property Load') ||
      this.accessory.addService(this.platform.Service.LightSensor, 'Property Load', "PropertyLoad"))
        .setCharacteristic(this.platform.Characteristic.Name, "Property Load")

    const gridLoadAsSensor = (this.accessory.getService('Grid Load') ||
      this.accessory.addService(this.platform.Service.LightSensor, 'Grid Load', "Grid Load"))
        .setCharacteristic(this.platform.Characteristic.Name, "Grid Load")

    const gridExportAsSensor = (this.accessory.getService('Grid Export') ||
      this.accessory.addService(this.platform.Service.LightSensor, 'Grid Export', "Grid Export"))
        .setCharacteristic(this.platform.Characteristic.Name, "Grid Export")

    const isFullySolarPoweredStatus = (this.accessory.getService('Fully Solar Powered') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'Fully Solar Powered', "FullySolarPowered"))
        .setCharacteristic(this.platform.Characteristic.Name, "Fully Solar Powered")

    const highExportStatus = (this.accessory.getService('High Export') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'High Export', "High Export"))
        .setCharacteristic(this.platform.Characteristic.Name, "High Export")

    const highImportStatus = (this.accessory.getService('High Import') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'High Import', "High Import"))
        .setCharacteristic(this.platform.Characteristic.Name, "High Import")

    const exceedingInverterMaxStatus = (this.accessory.getService('Exceeding Inverter Max') ||
      this.accessory.addService(this.platform.Service.ContactSensor, 'Exceeding Inverter Max', "ExceedingInverterMax"))
        .setCharacteristic(this.platform.Characteristic.Name, "Exceeding Inverter Max")


    const accessoryInformation = this.accessory.getService(this.platform.Service.AccessoryInformation) || 
      this.accessory.addService(this.platform.Service.AccessoryInformation)

    accessoryInformation.setCharacteristic(this.platform.Characteristic.Manufacturer, "Growatt")
    accessoryInformation.setCharacteristic(this.platform.Characteristic.Model, "Solar")

    console.log("Loaded battery accessory...")

    const updatePlantStatus = () => {
      console.log("Getting plant status...")
      console.log(`Logging into Growatt with username: '${this.platform.config.user}' and password: '${this.platform.config.password}'`)
      this.getPlantStatus().then((plantStatus)=>{
        
        console.log("Got updated plant status:")
        console.log(plantStatus)

        //this.service.updateCharacteristic(this.Characteristic.BatteryLevel,plantStatus.batterySOC || 0)
        //this.service.updateCharacteristic(this.Characteristic.StatusLowBattery,plantStatus.hasLowBattery ? this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW : this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL)
        //this.service.updateCharacteristic(this.Characteristic.ChargingState,plantStatus.isChargingFromGrid ? this.Characteristic.ChargingState.CHARGING : this.Characteristic.ChargingState.NOT_CHARGING)

        const sensorMin = 0.0001

        isChargingFromGridStatus.updateCharacteristic(this.platform.Characteristic.ContactSensorState, plantStatus.isChargingFromGrid ? this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED)
        hasSolarExcessStatus.updateCharacteristic(this.platform.Characteristic.ContactSensorState, plantStatus.hasSolarExcess ? this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED)
        chargeLevelAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, plantStatus.batterySOC)
        batteryChargeAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, plantStatus.chargingPower > sensorMin ? plantStatus.chargingPower : sensorMin) 
        batteryDischargeAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, plantStatus.batteryDischarge > sensorMin ? plantStatus.batteryDischarge : sensorMin) 
        pvPowerAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, plantStatus.pvPower > sensorMin ? plantStatus.pvPower : sensorMin) 
        propertyLoadAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, plantStatus.loadConsumption > sensorMin ? plantStatus.loadConsumption : sensorMin) 
        gridLoadAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, plantStatus.totalGridLoad > sensorMin ? plantStatus.totalGridLoad : sensorMin) 
        gridExportAsSensor.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, plantStatus.exportGridLoad > sensorMin ? plantStatus.exportGridLoad : sensorMin) 
        isFullySolarPoweredStatus.updateCharacteristic(this.platform.Characteristic.ContactSensorState, plantStatus.isFullySolarPowered ? this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED) 
        highExportStatus.updateCharacteristic(this.platform.Characteristic.ContactSensorState, plantStatus.highExport ? this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED)
        highImportStatus.updateCharacteristic(this.platform.Characteristic.ContactSensorState, plantStatus.highImport ? this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED)
        exceedingInverterMaxStatus.updateCharacteristic(this.platform.Characteristic.ContactSensorState, plantStatus.exceedingInverterMax ? this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED)

        })
    }

    updatePlantStatus()
    setInterval(() => {
      updatePlantStatus()
    }, 600000);
}
  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleStatusLowBatteryGet() {
    this.platform.log.debug('Triggered GET StatusLowBattery');

    // set this to a valid value for StatusLowBattery

    return this.currentStatus && this.currentStatus.batterySOC <= 25 ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
  }

  /**
   * Handle requests to get the current value of the "Status Low Battery" characteristic
   */
  handleChargingStateGet() {
    this.platform.log.debug('Triggered GET ChargingState');

    // set this to a valid value for StatusLowBattery

    return this.currentStatus && this.currentStatus.isChargingFromGrid ? this.platform.Characteristic.ChargingState.CHARGING : this.platform.Characteristic.ChargingState.NOT_CHARGING
  }

  handleBatteryLevelGet() {
    this.platform.log.debug('Triggered GET BatteryLevel');

    // set this to a valid value for StatusLowBattery
    return this.currentStatus ? this.currentStatus.batterySOC : 0
  }

  async getPlantStatus() {
    return new Promise<PlantStatus>((resolve)=>{

      try {

        const growatt = new this.growatt.api({})
        growatt.login(this.platform.config.user, this.platform.config.password).then(()=>{
          
          growatt.getAllPlantData(this.growatt.options).then((allPlantData)=>{

            const keys = Object.keys(allPlantData)
  
            if(keys.length <= 0) {
              throw("No plants were found...")
            }
      
            const plant = allPlantData[keys[0]]
      
            //let plantData = plant.plantData
            const devices = Object.keys(plant.devices)
      
            if(devices.length <=0) {
              throw("No devices were found...")
            }
      
            const device = plant.devices[devices[0]]
            const deviceStatus = device.statusData
      
            const parameters = {
              stateOfCharge: Number(deviceStatus.SOC || 0),
              chargingPower: Number(deviceStatus.chargePower || 0),
              pdisCharge1: deviceStatus.pdisCharge1,
              vPv2: deviceStatus.vPv2,
              vPv1: deviceStatus.vPv1,
              pPv2: deviceStatus.pPv2,
              pPv1: deviceStatus.pPv1,
              storagePpv: deviceStatus.storagePpv,
              status: deviceStatus.status,
              ppv: Number(deviceStatus.ppv || 0),
              propertyConsumption: deviceStatus.pLocalLoad,
              import: deviceStatus.pactouser,
              export: deviceStatus.pactogrid
            }

            //console.log(deviceStatus);
      
            const output : PlantStatus = {
              isChargingFromGrid: parameters.chargingPower > parameters.ppv ? true : false, // Returns true if the battery is charging from the grid
              hasSolarExcess: parameters.stateOfCharge > 90 && parameters.chargingPower > 500, // Returns true if the batteries are nearly full and the current solar levels predict excess that will be exported to the grid.
              batterySOC: parameters.stateOfCharge, // Returns the current battery state of charge.
              hasLowBattery: parameters.stateOfCharge < 25 ? true : false,
              chargingPower: parameters.chargingPower,
              batteryDischarge: parameters.pdisCharge1,
              pvPower: parameters.ppv,
              loadConsumption: parameters.propertyConsumption,
              totalGridLoad: parameters.import,
              exportGridLoad: parameters.export,
              isFullySolarPowered: parameters.propertyConsumption <= parameters.ppv ? true : false,
              highExport: parameters.export > 0.5 ? true : false,
              highImport: parameters.import > 2 ? true : false,
              exceedingInverterMax: parameters.propertyConsumption > 3 ? true : false
            }

            this.currentStatus = output;
      
            //console.log(deviceStatus)
            //console.log(parameters)
            //console.log(output)
      
            //let fs = require('fs')
            //fs.writeFileSync("plantData.json",JSON.stringify(plantData,null,2))
      
            growatt.logout().then(()=>{

              this.platform.log.debug(`Plant status updated...`);
              return resolve(output);

            }).catch(e => {console.log(e)});
          }).catch(e => {console.log(e)});
        }).catch(e => {console.log(e)});
  
  
      } catch(err) {
        this.platform.log.debug(`There was a problem fetching the plant data: ${err || "Unknown Error"}`);
      }

    });
  }

}

type PlantStatus = {
  isChargingFromGrid: boolean;
  hasSolarExcess: boolean;
  batterySOC: number;
  hasLowBattery: boolean;
  chargingPower: number;
  batteryDischarge: number;
  pvPower: number;
  loadConsumption: number;
  totalGridLoad: number;
  exportGridLoad: number;
  isFullySolarPowered: boolean;
  highExport: boolean;
  highImport: boolean;
  exceedingInverterMax: boolean;
};