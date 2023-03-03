import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import $ from './health.module.scss'
import Wrapper from '@components/Wrapper'
import Flex from '@components/Flex'
import Title from '@components/Title'
import Header from '@components/Header'
import HaederTitle from '@components/HeaderTitle'
import IconButton from '@components/IconButton'
import Button from '@components/Button'
import Input from '@components/Input'
import InputTime from '@components/InputTime'
import CountBox from '@components/CountBox'
import CheckBox from '@components/CheckBox'
import CheckBoxGroup from '@components/CheckBoxGroup'
import FloatMenu from '@components/FloatMenu'
import Calendar from 'react-calendar'
import Modal from '@components/Modal'
import moment from 'moment'
import dayjs from 'dayjs'
// import axios from 'axios'
import HealthWeatherInfoBox from './HealthWeatherInfoBox'
import { weatherInstance } from '@api/axiosInstance'
import logoBg from '@assets/ic-logo-bg.png'
import { themeState, dateState, partState } from '@store'
import { useRecoilState } from 'recoil'
import { localStorageService } from '@utils/localStorage.service'

export default function Health() {
  const navigate = useNavigate()
  const [dateRecoil, setDateRecoil] = useRecoilState(dateState)
  const [weatherData, setWeatherData] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [healthList, setHealthList] = useState([{}])
  const [todayMark, setTodayMark] = useState([])
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_KEY
  const [inputs, setInputs] = useState({
    date: '',
    healthName: '',
    healthCount: 1,
    healthWeight: '',
    healthSet: '',
    healthMinute: '',
    healthSecond: '',
  })
  const { healthName, healthCount, healthWeight, healthSet, healthMinute, healthSecond } = inputs

  const [healthCheckList, setHealthCheckList] = useState(['count'])

  const [modal, setModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState('')

  const sessionHealthTotal = localStorageService().get('HEALTH_TOTAL')
  const WEEKS = ['일', '월', '화', '수', '목', '금', '토']
  const healthDate = dayjs(dateRecoil).format(`MM월 DD일 ${WEEKS[dayjs(dateRecoil).get('d')]}요일`)

  const openCalendarHandler = () => {
    setCalendarOpen(!calendarOpen)
  }

  const onClickDayHandler = (date) => {
    setDateRecoil(date)
    setCalendarOpen(!calendarOpen)
  }

  const onClickModalHandler = (name) => {
    setModalTitle(`운동추가`)
    //setModalContent(`${name} 를(을) 삭제 하시겠습니까?`)
    setModal(!modal)
  }

  const modalOnClick = () => {
    const sesstionHealth = localStorageService().get('HEALTH_TOTAL')
    if (sesstionHealth) {
      sesstionHealth.push({ ...inputs, date: healthDate })
      localStorageService().set('HEALTH_TOTAL', sesstionHealth)
    } else {
      localStorageService().set('HEALTH_TOTAL', [{ ...inputs, date: healthDate }])
    }
    setHealthList({ ...inputs, date: healthDate })
    setModal(false)
  }

  const modalOnClose = () => {
    setModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const result = name !== 'healthName' ? value.replace(/\D/g, '') : value

    setInputs({ ...inputs, [name]: result })
  }

  const handleCountCalculation = (count) => {
    setInputs({ ...inputs, [healthCount]: count })
  }

  console.log(inputs)

  const onGeoOk = (poistion) => {
    const lat = poistion.coords.latitude
    const lng = poistion.coords.longitude
    getWeather(lat, lng)
  }

  const onGeoError = () => {
    console.log('위치를 찾지 못했습니다.')
  }

  const getWeather = async (lat, lng) => {
    const response = await weatherInstance(
      `/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
    )
    setWeatherData(response.data)
  }

  function test() {
    // const healthDateFilter = sessionHealthTotal
    //   ? sessionHealthTotal.filter((data) => data.date === healthDate)
    //   : []

    const healthDateMark = sessionHealthTotal ? sessionHealthTotal.map((data) => data.date) : []
    setTodayMark([...new Set(healthDateMark)])
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onGeoOk, onGeoError)
  }, [])

  useEffect(() => {
    test()
  }, [dateRecoil, modal])

  console.log(todayMark)

  const goHealthAdd = () => {
    navigate('add')
  }

  return (
    <Wrapper colorGray>
      {modal && (
        <Modal
          title={modalTitle}
          content={modalContent}
          onClick={modalOnClick}
          onClose={modalOnClose}
          confirm
        >
          <Title content="운동명" sub />
          <Input
            type="text"
            placeholder="무슨 운동을 하셨나요?"
            name="healthName"
            title="운동명"
            value={healthName}
            onChange={handleInputChange}
            unit={
              healthName && (
                <IconButton
                  kinds={'closeCircle'}
                  onClick={() => {
                    setInputs({ ...inputs, healthName: '' })
                  }}
                />
              )
            }
          />
          <CheckBoxGroup
            label="운동 추가하기"
            values={healthCheckList}
            onChange={setHealthCheckList}
          >
            <CheckBox value="healthCount" tab>
              횟수
            </CheckBox>
            <CheckBox value="healthWeight" tab>
              무게
            </CheckBox>
            <CheckBox value="healthSet" tab>
              세트
            </CheckBox>
            <CheckBox value="healthTime" tab>
              시간
            </CheckBox>
          </CheckBoxGroup>
          <Flex width start wrap>
            <Flex col2>
              <CountBox
                type="number"
                value={healthCount}
                name={'healthCount'}
                placeholder="0"
                title={'횟수'}
                //onChange={handleInputChange}
                handleCountCalculation={handleCountCalculation}
                marginBottomNone
                smallFont
              />
            </Flex>
            <Flex col2>
              <Input
                type="number"
                placeholder="0"
                name={'healthWeight'}
                title={'무게'}
                value={healthWeight}
                onChange={handleInputChange}
                unit={'kg'}
              />
            </Flex>
            <Flex col2>
              <Input
                type="number"
                placeholder="0"
                name={'healthSet'}
                title={'세트'}
                value={healthSet}
                onChange={handleInputChange}
              />
            </Flex>
            <Flex col2>
              <InputTime
                type="number"
                placeholder="0"
                title={'시간'}
                minute={healthMinute}
                second={healthSecond}
                onChange={handleInputChange}
              />
            </Flex>
          </Flex>
        </Modal>
      )}
      <Header>
        <Flex width between>
          <HaederTitle content="운동일지 " />
          <div className={$.header_icon_btn}>
            <IconButton kinds="calendar" onClick={openCalendarHandler} />
          </div>
        </Flex>
        {calendarOpen && (
          <Calendar
            onChange={setDateRecoil}
            value={dateRecoil}
            onClickDay={(date) => onClickDayHandler(date)}
            onFocus={() => {
              setCalendarOpen(true)
            }}
            tileClassName={({ date }) => {
              if (
                todayMark.find(
                  (x) => x === dayjs(date).format(`MM월 DD일 ${WEEKS[dayjs(date).get('d')]}요일`)
                )
              ) {
                return 'highlight'
              }
            }}
          />
        )}
      </Header>
      {weatherData && <HealthWeatherInfoBox data={weatherData} />}
      <Title content={'오늘의 운동'} sub>
        <Button content={'수정 및 추가하기'} none onClick={onClickModalHandler} />
      </Title>
      <ul className={$.health_list}>
        <li className={$.empty_list}>
          <img src={logoBg} alt="빈 접시" onClick={goHealthAdd} />
        </li>
      </ul>

      <FloatMenu />
    </Wrapper>
  )
}
